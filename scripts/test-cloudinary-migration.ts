import { createClient } from '@supabase/supabase-js';
import { v2 as cloudinary } from 'cloudinary';
import { initCloudinary } from '../src/utils/cloudinaryStorage.js';
import { migrate, verifyMigration } from './migrate-to-cloudinary.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// Required environment variables
const requiredEnvVars = [
  'NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME',
  'NEXT_PUBLIC_CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

// Initialize clients with error handling
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!,
  { auth: { persistSession: false } }
);

// Initialize Cloudinary
initCloudinary();

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

// Add global error handler for uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
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

    // Get file stats for size
    const stats = fs.statSync(testFile);
    const fileInfo = {
      path: testFile,
      name: 'test-image.png',
      type: 'image/png',
      size: stats.size
    };

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
          file_name: fileInfo.name,
          mime_type: fileInfo.type,
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
    console.log('Environment variables loaded and validated');
    console.log('Supabase client initialized');
    console.log('Cloudinary initialized');

    // Test file upload and migration
    console.log('\nRunning file upload and migration test...');
    const migratedItem = await testFileUpload();
    console.log('File upload and migration test passed');

    // Test rollback procedure
    console.log('\nRunning rollback test...');
    await testRollback();
    console.log('Rollback test passed');

    console.log('\nAll tests completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Tests failed with error:', error instanceof Error ? error.stack : JSON.stringify(error, null, 2));
    process.exit(1);
  }
}

// Run the tests
console.log('Starting migration test suite...');
runTests().catch((error) => {
  console.error('Test suite failed:', error);
  process.exit(1);
});

export { testFileUpload, testRollback, runTests };
