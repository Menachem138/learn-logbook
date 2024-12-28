import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { S3Client, DeleteObjectCommand } from "npm:@aws-sdk/client-s3"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { key } = await req.json()
    
    if (!key) {
      throw new Error('No key provided')
    }

    const s3Client = new S3Client({
      region: Deno.env.get('AWS_REGION') || '',
      credentials: {
        accessKeyId: Deno.env.get('AWS_ACCESS_KEY_ID') || '',
        secretAccessKey: Deno.env.get('AWS_SECRET_ACCESS_KEY') || '',
      },
    })

    const command = new DeleteObjectCommand({
      Bucket: Deno.env.get('AWS_BUCKET_NAME'),
      Key: key,
    })

    await s3Client.send(command)

    return new Response(
      JSON.stringify({ message: 'File deleted successfully' }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    )
  } catch (error) {
    console.error('Error deleting from S3:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  }
})