import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { S3Client, PutObjectCommand } from "npm:@aws-sdk/client-s3"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      throw new Error('No file provided')
    }

    console.log('Uploading file:', { fileName: file.name, fileType: file.type });

    const s3Client = new S3Client({
      region: Deno.env.get('AWS_REGION') || '',
      credentials: {
        accessKeyId: Deno.env.get('AWS_ACCESS_KEY_ID') || '',
        secretAccessKey: Deno.env.get('AWS_SECRET_ACCESS_KEY') || '',
      },
    })

    const fileBuffer = await file.arrayBuffer()
    const fileKey = `${crypto.randomUUID()}-${file.name}`

    const command = new PutObjectCommand({
      Bucket: Deno.env.get('AWS_BUCKET_NAME'),
      Key: fileKey,
      Body: fileBuffer,
      ContentType: file.type,
    })

    await s3Client.send(command)

    const fileUrl = `https://${Deno.env.get('AWS_BUCKET_NAME')}.s3.${Deno.env.get('AWS_REGION')}.amazonaws.com/${fileKey}`

    console.log('File uploaded successfully:', { fileUrl, fileKey });

    return new Response(
      JSON.stringify({
        url: fileUrl,
        key: fileKey,
        size: file.size,
        type: file.type,
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    )
  } catch (error) {
    console.error('Error uploading to S3:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 500
      }
    )
  }
})