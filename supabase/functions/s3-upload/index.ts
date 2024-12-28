import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { S3Client, PutObjectCommand } from "npm:@aws-sdk/client-s3"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders,
      status: 204
    });
  }

  try {
    // Validate request method
    if (req.method !== 'POST') {
      throw new Error('Method not allowed');
    }

    console.log('Starting file upload process');
    
    const formData = await req.formData();
    const file = formData.get('file');
    
    if (!file) {
      throw new Error('No file provided');
    }

    // Validate environment variables
    const bucketName = Deno.env.get('AWS_BUCKET_NAME')?.replace('arn:aws:s3:::', '');
    const accessKeyId = Deno.env.get('AWS_ACCESS_KEY_ID');
    const secretAccessKey = Deno.env.get('AWS_SECRET_ACCESS_KEY');

    if (!bucketName || !accessKeyId || !secretAccessKey) {
      throw new Error('Missing required AWS credentials');
    }

    console.log('Initializing S3 client with region eu-north-1');

    const s3Client = new S3Client({
      region: 'eu-north-1',
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });

    const fileBuffer = await file.arrayBuffer();
    const fileKey = `${crypto.randomUUID()}-${file.name}`;

    console.log('Uploading file:', { fileKey, bucketName, contentType: file.type });

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileKey,
      Body: fileBuffer,
      ContentType: file.type,
    });

    await s3Client.send(command);

    const fileUrl = `https://${bucketName}.s3.eu-north-1.amazonaws.com/${fileKey}`;
    
    console.log('File uploaded successfully:', { fileUrl });

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
        },
        status: 200
      }
    );
  } catch (error) {
    console.error('Error in s3-upload function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack,
        env: {
          bucketName: Deno.env.get('AWS_BUCKET_NAME'),
          region: 'eu-north-1',
          hasAccessKey: !!Deno.env.get('AWS_ACCESS_KEY_ID'),
          hasSecretKey: !!Deno.env.get('AWS_SECRET_ACCESS_KEY'),
        }
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 500
      }
    );
  }
});