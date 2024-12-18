import { createClient } from '@supabase/supabase-js';
import { initCloudinary } from '../src/utils/cloudinaryStorage.js';
import { migrate, verifyMigration } from './migrate-to-cloudinary.js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Verify environment variables
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME',
  'NEXT_PUBLIC_CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

// Initialize clients with error handling
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

// Add global error handler for unhandled rejections
process.on('unhandledRejection', (error) => {
  console.error('Unhandled promise rejection:', error);
  if (error instanceof Error) {
    console.error('Error message:', error.message);
    console.error('Stack trace:', error.stack);
  } else {
    console.error('Non-Error object rejection:', JSON.stringify(error, null, 2));
  }
  process.exit(1);
});

async function createTestFile() {
  const testDir = path.join(__dirname, '../test-files');
  const testFile = path.join(testDir, 'test-image.png');

  // Create test directory if it doesn't exist
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
  }

  // Create a simple test image (1x1 pixel transparent PNG)
  const testImageData = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==', 'base64');
  fs.writeFileSync(testFile, testImageData);

  return new File([testImageData], 'test-image.png', { type: 'image/png' });
}

async function testFileUpload() {
  console.log('Testing file upload to Cloudinary...');

  try {
    // Create test file
    const testFile = await createTestFile();
    const testUserId = 'test-user';

    // Upload to Supabase first
    const fileExt = testFile.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `${testUserId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('content_library')
      .upload(filePath, testFile);

    if (uploadError) {
      throw new Error(`Failed to upload to Supabase: ${uploadError.message}`);
    }

    // Get Supabase URL
    const { data: { publicUrl: supabaseUrl } } = supabase.storage
      .from('content_library')
      .getPublicUrl(filePath);

    // Create test content item
    const { data: contentItem, error: insertError } = await supabase
      .from('content_items')
      .insert({
        user_id: testUserId,
        file_path: filePath,
        file_name: testFile.name,
        mime_type: testFile.type,
        type: 'image'
      })
      .select()
      .single();

    if (insertError || !contentItem) {
      throw new Error(`Failed to create test content item: ${insertError?.message}`);
    }

    // Test migration
    await migrate();

    // Verify migration results
    const results = await verifyMigration();
    console.log('Test migration results:', results);

    // Verify both URLs are accessible
    const supabaseResponse = await fetch(supabaseUrl);
    if (!supabaseResponse.ok) {
      throw new Error(`Failed to access Supabase URL during migration: ${supabaseResponse.statusText}`);
    }
    console.log('Successfully verified Supabase URL remains accessible');

    // Get migrated item
    const { data: migratedItem } = await supabase
      .from('content_items')
      .select('cloudinary_url')
      .eq('id', contentItem.id)
      .single();

    if (migratedItem?.cloudinary_url) {
      const cloudinaryResponse = await fetch(migratedItem.cloudinary_url);
      if (!cloudinaryResponse.ok) {
        throw new Error(`Failed to access Cloudinary URL: ${cloudinaryResponse.statusText}`);
      }
      console.log('Successfully verified Cloudinary URL access');
    }

    console.log('File upload and URL verification test completed successfully');
    return true;
  } catch (error) {
    console.error('File upload test failed:', error);
    return false;
  }
}

async function testRollback() {
  console.log('Testing rollback procedure...');

  try {
    // Get a migrated content item
    const { data: contentItem } = await supabase
      .from('content_items')
      .select('*')
      .not('cloudinary_url', 'is', null)
      .limit(1)
      .single();

    if (!contentItem) {
      throw new Error('No migrated content item found for rollback test');
    }

    // Store original values
    const originalCloudinaryUrl = contentItem.cloudinary_url;
    const originalPublicId = contentItem.cloudinary_public_id;

    // Perform rollback
    const { error: updateError } = await supabase
      .from('content_items')
      .update({
        cloudinary_url: null,
        cloudinary_public_id: null
      })
      .eq('id', contentItem.id);

    if (updateError) {
      throw new Error(`Failed to rollback content item: ${updateError.message}`);
    }

    // Verify Supabase URL still works
    const { data: { publicUrl: supabaseUrl } } = supabase.storage
      .from('content_library')
      .getPublicUrl(contentItem.file_path!);

    const response = await fetch(supabaseUrl);
    if (!response.ok) {
      throw new Error(`Failed to access Supabase URL after rollback: ${response.statusText}`);
    }

    console.log('Successfully verified Supabase URL after rollback');

    // Restore the item to its original state
    await supabase
      .from('content_items')
      .update({
        cloudinary_url: originalCloudinaryUrl,
        cloudinary_public_id: originalPublicId
      })
      .eq('id', contentItem.id);

    console.log('Rollback test completed successfully');
    return true;
  } catch (error) {
    console.error('Rollback test failed:', error);
    return false;
  }
}

async function runTests() {
  console.log('Starting Cloudinary migration tests...');

  // Initialize Cloudinary
  initCloudinary();

  // Run tests
  const uploadSuccess = await testFileUpload();
  const rollbackSuccess = await testRollback();

  // Report results
  console.log('\nTest Results:');
  console.log('-------------');
  console.log('File Upload and URL Verification:', uploadSuccess ? '✅ Passed' : '❌ Failed');
  console.log('Rollback Procedure:', rollbackSuccess ? '✅ Passed' : '❌ Failed');

  // Exit with appropriate code
  process.exit(uploadSuccess && rollbackSuccess ? 0 : 1);
}

// Run tests if called directly
if (require.main === module) {
  runTests();
}

export { testFileUpload, testRollback, runTests };
