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
  try {
    const testDir = path.join(__dirname, '../test-files');
    const testFile = path.join(testDir, 'test-image.png');

    // Create test directory if it doesn't exist
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }

    // Create a simple test image (1x1 pixel transparent PNG)
    const testImageData = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==', 'base64');
    fs.writeFileSync(testFile, testImageData);

    return testFile;
  } catch (error) {
    console.error('Error creating test file:', error);
    throw error;
  }
}

async function testFileUpload() {
  console.log('Starting file upload test...');
  try {
    const testFile = await createTestFile();
    console.log('Test file created:', testFile);

    // Upload to Supabase
    const fileBuffer = fs.readFileSync(testFile);
    const fileName = `test-${Date.now()}.png`;
    const { error: uploadError, data } = await supabase.storage
      .from('content_library')
      .upload(fileName, fileBuffer);

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      throw uploadError;
    }

    console.log('File uploaded to Supabase successfully');

    // Get public URL
    const { data: { publicUrl: supabaseUrl } } = supabase.storage
      .from('content_library')
      .getPublicUrl(fileName);

    console.log('Supabase public URL:', supabaseUrl);

    // Create content item
    const { data: contentItem, error: insertError } = await supabase
      .from('content_items')
      .insert([
        {
          title: 'Test Content',
          description: 'Test migration content',
          file_path: fileName,
          file_name: 'test-image.png',
          mime_type: 'image/png',
          type: 'image',
          user_id: 'test-user'
        }
      ])
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting content item:', insertError);
      throw insertError;
    }

    console.log('Content item created:', contentItem);

    // Run migration
    await migrate();
    console.log('Migration completed');

    // Verify migration
    const { data: migratedItem } = await supabase
      .from('content_items')
      .select('*')
      .eq('id', contentItem.id)
      .single();

    if (!migratedItem?.cloudinary_url) {
      throw new Error('Migration verification failed: cloudinary_url is missing');
    }

    console.log('Migration verified:', migratedItem);
    return migratedItem;
  } catch (error) {
    console.error('File upload test failed:', error);
    throw error;
  }
}

async function testRollback() {
  console.log('Starting rollback test...');
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

    console.log('Found content item for rollback:', contentItem);

    // Simulate rollback by clearing Cloudinary URL
    const { error: updateError } = await supabase
      .from('content_items')
      .update({
        cloudinary_url: null,
        cloudinary_public_id: null
      })
      .eq('id', contentItem.id);

    if (updateError) {
      console.error('Error updating content item:', updateError);
      throw updateError;
    }

    console.log('Cloudinary data cleared for rollback test');

    // Verify original Supabase URL still works
    const { data: { publicUrl: supabaseUrl } } = supabase.storage
      .from('content_library')
      .getPublicUrl(contentItem.file_path);

    const response = await fetch(supabaseUrl);
    if (!response.ok) {
      throw new Error(`Original Supabase URL is not accessible: ${supabaseUrl}`);
    }

    console.log('Rollback test successful: original URL still accessible');
    return true;
  } catch (error) {
    console.error('Rollback test failed:', error);
    throw error;
  }
}

async function runTests() {
  try {
    console.log('Starting migration tests...');

    // Test file upload and migration
    const migratedItem = await testFileUpload();
    console.log('File upload and migration test passed');

    // Test rollback procedure
    await testRollback();
    console.log('Rollback test passed');

    console.log('All tests completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Tests failed:', error);
    process.exit(1);
  }
}

// Run the tests
runTests();

// Run tests if called directly
if (require.main === module) {
  runTests();
}

export { testFileUpload, testRollback, runTests };
