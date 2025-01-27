import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface PushNotification {
  title: string
  body: string
  data?: Record<string, unknown>
}

interface RequestBody {
  user_ids: string[]
  notification: PushNotification
}

serve(async (req) => {
  try {
    // Verify request method
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 })
    }

    // Get request body
    const body: RequestBody = await req.json()
    const { user_ids, notification } = body

    if (!user_ids?.length || !notification?.title || !notification?.body) {
      return new Response('Invalid request body', { status: 400 })
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get push tokens for users
    const { data: tokens, error: tokensError } = await supabaseClient
      .from('user_push_tokens')
      .select('push_token, device_type')
      .in('user_id', user_ids)

    if (tokensError) {
      console.error('Error fetching push tokens:', tokensError)
      return new Response('Error fetching push tokens', { status: 500 })
    }

    if (!tokens?.length) {
      return new Response('No push tokens found', { status: 404 })
    }

    // Send push notifications using Expo
    const messages = tokens.map((token) => ({
      to: token.push_token,
      title: notification.title,
      body: notification.body,
      data: notification.data || {},
      sound: 'default',
      priority: 'high',
    }))

    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messages),
    })

    if (!response.ok) {
      throw new Error(`Error sending push notifications: ${response.statusText}`)
    }

    const result = await response.json()

    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Error in send-push-notification function:', error)
    return new Response(error.message, { status: 500 })
  }
})
