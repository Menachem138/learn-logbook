import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { initSupabase, fetchUserData } from "./utils/supabaseClient.ts"
import { buildContext } from "./utils/contextBuilder.ts"
import { initGemini, generatePrompt, fetchWithRetry } from "./utils/geminiClient.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// In-memory rate limiting
const requestTimestamps: { [key: string]: number[] } = {}
const RATE_LIMIT_WINDOW = 60000
const MAX_REQUESTS_PER_MINUTE = 5

function isRateLimited(userId: string): boolean {
  const now = Date.now()
  const userRequests = requestTimestamps[userId] || []
  
  requestTimestamps[userId] = userRequests.filter(
    timestamp => now - timestamp < RATE_LIMIT_WINDOW
  )
  
  if (requestTimestamps[userId].length >= MAX_REQUESTS_PER_MINUTE) {
    return true
  }
  
  requestTimestamps[userId].push(now)
  return false
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { message, userId } = await req.json()

    if (isRateLimited(userId)) {
      console.log(`Rate limit exceeded for user ${userId}`)
      return new Response(
        JSON.stringify({ 
          error: 'Rate limit exceeded',
          details: 'Please wait a moment before sending another message'
        }),
        { 
          status: 429,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      )
    }

    const supabase = initSupabase()
    const userData = await fetchUserData(supabase, userId)
    const context = buildContext(userData)
    const model = initGemini()
    const prompt = generatePrompt(context, message)

    console.log('Generating focused response...')
    const response = await fetchWithRetry(model, prompt)
    const text = response.text()
    
    console.log('Successfully generated response')
    return new Response(
      JSON.stringify({ response: text }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in chat-assistant function:', error)
    
    const isRateLimit = error.message?.includes('429') || 
                       error.message?.includes('RATE_LIMIT_EXCEEDED') ||
                       error.message?.includes('quota exceeded')
    
    return new Response(
      JSON.stringify({ 
        error: isRateLimit ? 'Rate limit exceeded' : 'Failed to process chat request',
        details: error.message 
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        },
        status: isRateLimit ? 429 : 500 
      }
    )
  }
})