import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Load environment variables before any other imports
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
console.log('Loading environment variables from:', path.resolve(__dirname, '../.env.local'));
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

import { createClient } from '@supabase/supabase-js';
import { v2 as cloudinary } from 'cloudinary';
import { initCloudinary } from '../src/utils/cloudinaryStorage.js';
import { migrate, verifyMigration } from './migrate-to-cloudinary.js';
import fs from 'node:fs';
import { v4 as uuidv4 } from 'uuid';

// Required environment variables
const requiredEnvVars = [
  'NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME',
  'NEXT_PUBLIC_CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'TEST_USER_EMAIL',
  'TEST_USER_PASSWORD'
];

console.log('Verifying environment variables...');
requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    console.error(`Missing required environment variable: ${varName}`);
    process.exit(1);
  }
  // Log that we found the variable (without exposing its value)
  console.log(`✓ Found ${varName}`);
});

console.log('Environment variables verified successfully');

// Initialize clients with error handling
console.log('Initializing Supabase client...');
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!,
  { auth: { persistSession: false } }
);

// Initialize test environment
async function initTestEnvironment() {
  console.log('Initializing test environment...');

  const MAX_RETRIES = 3;
  let retryCount = 0;

  while (retryCount < MAX_RETRIES) {
    try {
      // Sign in with test user credentials
      const { data: { user }, error: signInError } = await supabase.auth.signInWithPassword({
        email: process.env.TEST_USER_EMAIL || 'test@example.com',
        password: process.env.TEST_USER_PASSWORD || 'test123'
      });

      if (signInError) {
        console.error('Authentication error:', signInError.message);
        if (signInError.message.includes('Invalid login credentials')) {
          throw new Error('Test user credentials are invalid. Please check TEST_USER_EMAIL and TEST_USER_PASSWORD environment variables.');
        }
        throw signInError;
      }

      if (!user) {
        throw new Error('No user data received after successful authentication');
      }

      console.log('Test environment initialized with user:', user.id);
      return { id: user.id };
    } catch (error) {
      retryCount++;
      if (retryCount === MAX_RETRIES) {
        console.error('Max retries reached. Authentication failed.');
        throw error;
      }
      console.log(`Authentication attempt ${retryCount} failed. Retrying...`);
      await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
    }
  }

  throw new Error('Failed to initialize test environment after multiple attempts');
}

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

async function testFileUpload(userId: string) {
  console.log('Starting file upload test...');
  const MAX_RETRIES = 3;
  let retryCount = 0;

  while (retryCount < MAX_RETRIES) {
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
            content: 'Test migration content',
            type: 'image',
            user_id: userId,
            file_path: fileName,
            file_name: fileInfo.name,
            mime_type: fileInfo.type,
            file_size: fileInfo.size,
            starred: false
          }
        ])
        .select()
        .single();

      if (insertError) {
        console.error('Error inserting content item:', insertError);
        throw insertError;
      }

      console.log('Content item created:', contentItem);

      // Add delay to ensure transaction is committed
      console.log('Waiting for transaction to commit...');
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Run migration
      console.log('Starting migration process...');
      await migrate();
      console.log('Migration completed');

      // Add delay to ensure migration is completed
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Verify migration
      console.log('Verifying migration...');
      const { data: migratedItem, error: verifyError } = await supabase
        .from('content_items')
        .select('*')
        .eq('id', contentItem.id)
        .single();

      if (verifyError) {
        console.error('Error verifying migration:', verifyError);
        throw verifyError;
      }

      if (!migratedItem?.cloudinary_url) {
        throw new Error('Migration verification failed: cloudinary_url is missing');
      }

      console.log('Migration verified:', migratedItem);
      return migratedItem;
    } catch (error) {
      retryCount++;
      console.error(`Attempt ${retryCount} failed:`, error);

      if (retryCount === MAX_RETRIES) {
        console.error('Max retries reached. File upload test failed.');
        throw error;
      }

      console.log(`Retrying in ${retryCount} seconds...`);
      await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
    }
  }

  throw new Error('File upload test failed after multiple attempts');
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

    // Initialize test environment
    const testUser = await initTestEnvironment();

    console.log('\nRunning file upload and migration test...');
    await testFileUpload(testUser.id);

    console.log('\nRunning rollback test...');
    await testRollback();

    console.log('\nAll tests completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Tests failed with error:', error instanceof Error ? error.stack : JSON.stringify(error, null, 2));
    process.exit(1);
  }
}

// Check if file is being run directly (ESM version)
const isMainModule = import.meta.url === `file://${process.argv[1]}`;

if (isMainModule) {
  console.log('Starting migration test suite...');
  runTests().catch((error) => {
    console.error('Test suite failed:', error);
    process.exit(1);
  });
}

export { testFileUpload, testRollback, runTests };
