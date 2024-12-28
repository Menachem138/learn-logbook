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

    // Get AWS credentials
    const bucketName = Deno.env.get('AWS_BUCKET_NAME');
    const accessKeyId = Deno.env.get('AWS_ACCESS_KEY_ID');
    const secretAccessKey = Deno.env.get('AWS_SECRET_ACCESS_KEY');
    const region = Deno.env.get('AWS_REGION') || 'eu-north-1';

    // Validate AWS credentials
    if (!bucketName || !accessKeyId || !secretAccessKey) {
      console.error('Missing AWS credentials');
      throw new Error('Missing required AWS credentials');
    }

    // Clean bucket name (remove any ARN prefix if present)
    const cleanBucketName = bucketName.replace('arn:aws:s3:::', '');
    
    console.log('Processing file upload request');
    
    const formData = await req.formData();
    const file = formData.get('file');
    
    if (!file || !(file instanceof File)) {
      throw new Error('No file provided');
    }

    console.log('File details:', {
      name: file.name,
      type: file.type,
      size: file.size
    });

    const s3Client = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });

    const fileBuffer = await file.arrayBuffer();
    const fileKey = `${crypto.randomUUID()}-${file.name}`;

    console.log('Uploading to S3:', {
      bucket: cleanBucketName,
      key: fileKey,
      contentType: file.type
    });

    const command = new PutObjectCommand({
      Bucket: cleanBucketName,
      Key: fileKey,
      Body: fileBuffer,
      ContentType: file.type,
    });

    await s3Client.send(command);

    const fileUrl = `https://${cleanBucketName}.s3.${region}.amazonaws.com/${fileKey}`;
    
    console.log('Upload successful:', { fileUrl });

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
        details: error.stack
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