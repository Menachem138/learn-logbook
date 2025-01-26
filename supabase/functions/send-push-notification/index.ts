import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NotificationPayload {
  user_id: string
  notification: {
    title: string
    body: string
    data?: Record<string, any>
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { user_id, notification } = await req.json() as NotificationPayload

    // Get user's push tokens
    const { data: tokens, error: tokenError } = await supabaseClient
      .from('user_push_tokens')
      .select('push_token, platform')
      .eq('user_id', user_id)

    if (tokenError) {
      throw new Error(`Error fetching push tokens: ${tokenError.message}`)
    }

    if (!tokens || tokens.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No push tokens found for user' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        }
      )
    }

    // Send notifications through FCM
    const fcmEndpoint = 'https://fcm.googleapis.com/fcm/send'
    const fcmApiKey = Deno.env.get('FCM_SERVER_KEY')

    if (!fcmApiKey) {
      throw new Error('FCM_SERVER_KEY not configured')
    }

    const responses = await Promise.all(
      tokens.map(async (token) => {
        const fcmPayload = {
          to: token.push_token,
          notification: {
            title: notification.title,
            body: notification.body,
          },
          data: notification.data || {},
        }

        const response = await fetch(fcmEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `key=${fcmApiKey}`,
          },
          body: JSON.stringify(fcmPayload),
        })

        if (!response.ok) {
          // If token is invalid, remove it from the database
          if (response.status === 404 || response.status === 400) {
            await supabaseClient
              .from('user_push_tokens')
              .delete()
              .eq('push_token', token.push_token)
          }
          throw new Error(`FCM error: ${await response.text()}`)
        }

        return response.json()
      })
    )

    return new Response(
      JSON.stringify({ success: true, results: responses }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
