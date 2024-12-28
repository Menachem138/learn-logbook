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

    // Extract bucket name from ARN (remove the "arn:aws:s3:::" prefix)
    const bucketName = (Deno.env.get('AWS_BUCKET_NAME') || '').replace('arn:aws:s3:::', '')
    
    console.log('Starting file upload process:', { 
      fileName: file.name, 
      fileType: file.type,
      bucketName: bucketName,
      region: Deno.env.get('AWS_REGION')
    });

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
      Bucket: bucketName,
      Key: fileKey,
      Body: fileBuffer,
      ContentType: file.type,
    })

    console.log('Attempting to upload to S3:', { fileKey });

    await s3Client.send(command)

    const fileUrl = `https://${bucketName}.s3.${Deno.env.get('AWS_REGION')}.amazonaws.com/${fileKey}`

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
    console.error('Error in s3-upload function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack 
      }),
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