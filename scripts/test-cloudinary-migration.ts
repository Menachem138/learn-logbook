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

// Define FileInfo type
interface FileInfo {
  buffer: Buffer;
  path: string;
  name: string;
  size: number;
  type: string;
}

// Required environment variables
const requiredEnvVars = [
  'NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME',
  'NEXT_PUBLIC_CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
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
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // Use service role key for testing
  { auth: { persistSession: false } }
);

// Initialize test environment
async function initTestEnvironment() {
  console.log('Initializing test environment...');

  try {
    // When using service role, we don't need to authenticate
    // Just verify database access
    const { count, error: testError } = await supabase
      .from('content_items')
      .select('*', { count: 'exact', head: true });

    if (testError) {
      throw new Error(`Database access test failed: ${testError.message}`);
    }

    console.log('Database access verified with service role');

    // Ensure required schema changes are in place
    const { error: schemaError } = await supabase.rpc('verify_cloudinary_schema');

    if (schemaError) {
      console.log('Adding required schema changes...');

      // Add Cloudinary-specific columns if they don't exist
      const { error: alterError } = await supabase.rpc('apply_cloudinary_schema', {});

      if (alterError) {
        throw new Error(`Failed to add schema changes: ${alterError.message}`);
      }

      console.log('Schema changes applied successfully');
    }

    // Clean up any test data from previous runs
    await supabase
      .from('content_items')
      .delete()
      .eq('content', 'Test migration content');

    console.log('Test environment initialized successfully');
    return true;
  } catch (error) {
    console.error('Failed to initialize test environment:', error);
    throw error;
  }
}

// Global error handlers
process.on('unhandledRejection', (error) => {
  console.error('Unhandled promise rejection:', error);
  process.exit(1);
});

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

async function createTestFile(): Promise<FileInfo> {
  const testFilePath = path.join(__dirname, 'test-image.png');

  // Create a simple 1x1 pixel PNG
  const buffer = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
    0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4, 0x89, 0x00, 0x00, 0x00,
    0x0A, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9C, 0x63, 0x00, 0x00, 0x00, 0x05,
    0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45,
    0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
  ]);

  return {
    buffer,
    path: testFilePath,
    name: 'test-image.png',
    size: buffer.length,
    type: 'image/png'
  };
}

async function testFileUpload() {
  console.log('Starting file upload test...');
  try {
    // Create test file
    const fileInfo = await createTestFile();
    console.log(`Test file created: ${fileInfo.path}`);

    // Upload file to Supabase
    const { error: uploadError, data } = await supabase.storage
      .from('content_library')
      .upload(`test-${Date.now()}.png`, fileInfo.buffer);

    if (uploadError) {
      throw new Error(`Failed to upload file to Supabase: ${uploadError.message}`);
    }

    if (!data?.path) {
      throw new Error('No file path returned from Supabase upload');
    }

    console.log('File uploaded to Supabase successfully');

    // Get public URL
    const { data: { publicUrl: supabaseUrl } } = await supabase.storage
      .from('content_library')
      .getPublicUrl(data.path);

    // Verify file exists in Supabase storage
    const { data: fileExists } = await supabase.storage
      .from('content_library')
      .list('', { search: data.path });

    if (!fileExists?.length) {
      throw new Error('File not found in Supabase storage after upload');
    }

    console.log('Supabase public URL:', supabaseUrl);

    // Create content item
    const { data: contentItem, error: insertError } = await supabase
      .from('content_items')
      .insert({
        content: 'Test migration content',
        type: 'image',
        file_path: data.path,
        file_name: fileInfo.name,
        file_size: fileInfo.size,
        mime_type: fileInfo.type,
        cloudinary_url: null,
        cloudinary_public_id: null
      })
      .select()
      .single();

    if (insertError) {
      throw new Error(`Failed to create content item: ${insertError.message}`);
    }

    console.log('Content item created:', contentItem);

    // Wait for transaction to commit
    console.log('Waiting for transaction to commit...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Start migration process
    console.log('Starting migration process...');
    await migrate();
    console.log('Migration completed');

    // Wait for migration to complete
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Verify migration
    console.log('Verifying migration...');
    const { data: migratedItem, error: verifyError } = await supabase
      .from('content_items')
      .select('*')
      .eq('id', contentItem.id)
      .single();

    if (verifyError) {
      throw new Error(`Failed to verify migration: ${verifyError.message}`);
    }

    if (!migratedItem.cloudinary_url) {
      throw new Error('Migration verification failed: cloudinary_url is missing');
    }

    console.log('Migration verified successfully');
    return true;
  } catch (error) {
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

    // Initialize Cloudinary first
    initCloudinary();
    console.log('Cloudinary initialized');

    console.log('Environment variables loaded and validated');
    console.log('Supabase client initialized');

    // Initialize test environment
    await initTestEnvironment();

    console.log('\nRunning file upload and migration test...');
    await testFileUpload();

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
