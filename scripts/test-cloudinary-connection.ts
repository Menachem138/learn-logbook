import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// Helper function to recursively remove directory
async function removeDir(dirPath: string) {
  try {
    const files = await fs.readdir(dirPath);
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stats = await fs.stat(filePath);
      if (stats.isDirectory()) {
        await removeDir(filePath);
      } else {
        await fs.unlink(filePath);
      }
    }
    await fs.rmdir(dirPath);
  } catch (error) {
    console.error(`Error cleaning up directory ${dirPath}:`, error);
  }
}

// Helper function to wait for a specified time
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function testCloudinaryConnection() {
  let testDir: string | null = null;
  try {
    console.log('Testing Cloudinary connection...');

    // Configure Cloudinary
    cloudinary.config({
      cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });

    // Test API access by getting usage info
    console.log('\nTesting API access...');
    const usage = await cloudinary.api.usage();
    console.log('Successfully accessed Cloudinary API');

    // Create test directory for sample files
    testDir = path.join(__dirname, '../public/test-data');
    await fs.mkdir(testDir, { recursive: true });

    // Create a small test file
    const testFile = path.join(testDir, 'test-upload.txt');
    await fs.writeFile(testFile, 'Test content for Cloudinary upload');

    // Test file upload
    console.log('\nTesting file upload...');
    const uploadResult = await cloudinary.uploader.upload(testFile, {
      resource_type: 'raw',
      public_id: 'test/connection-test.txt',
      overwrite: true
    });
    console.log('Successfully uploaded test file:', uploadResult.secure_url);

    // Wait for propagation
    console.log('\nWaiting for file propagation...');
    await wait(2000); // Wait 2 seconds for propagation

    // Test file retrieval using admin API
    console.log('\nTesting file retrieval...');
    try {
      const resource = await cloudinary.api.resource('test/connection-test.txt', {
        resource_type: 'raw'
      });
      console.log('Successfully retrieved file info:', resource.secure_url);
    } catch (error) {
      const errorMessage = error.error?.message || error.message || 'Unknown error';
      throw new Error(`File not found in Cloudinary: ${errorMessage}`);
    }

    // Test file deletion
    console.log('\nTesting file deletion...');
    const deleteResult = await cloudinary.uploader.destroy('test/connection-test.txt', { resource_type: 'raw' });
    console.log('Successfully deleted test file');

    console.log('\nAll Cloudinary connection tests passed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\nConnection test failed:', error.message);
    process.exit(1);
  } finally {
    // Clean up test directory if it was created
    if (testDir) {
      await removeDir(testDir);
    }
  }
}

testCloudinaryConnection();
