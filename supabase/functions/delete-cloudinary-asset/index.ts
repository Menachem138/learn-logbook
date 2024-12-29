import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { v2 as cloudinary } from 'https://esm.sh/cloudinary@1.37.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { publicId } = await req.json()

    if (!publicId) {
      return new Response(
        JSON.stringify({ error: 'Public ID is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Configure Cloudinary
    cloudinary.config({
      cloud_name: Deno.env.get('CLOUDINARY_CLOUD_NAME'),
      api_key: Deno.env.get('CLOUDINARY_API_KEY'),
      api_secret: Deno.env.get('CLOUDINARY_API_SECRET'),
    })

    // Delete the asset using raw resource type
    const result = await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' })

    return new Response(
      JSON.stringify({ result: result.result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})