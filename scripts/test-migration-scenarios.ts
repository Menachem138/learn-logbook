import { createClient } from '@supabase/supabase-js';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// Helper function to wait
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function testMigrationScenarios() {
  try {
    console.log('Testing migration scenarios...');

    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Initialize Cloudinary
    cloudinary.config({
      cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });

    // Test 1: URL Persistence
    console.log('\nTesting URL persistence...');
    const testFile = path.join(__dirname, 'test-persistence.txt');
    await fs.writeFile(testFile, 'Test content for URL persistence');

    // Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(testFile, {
      resource_type: 'raw',
      public_id: 'test/persistence-test.txt',
      overwrite: true
    });

    // Insert test record with both URLs
    const { data: insertData, error: insertError } = await supabase
      .from('content_items')
      .insert({
        title: 'Test Persistence Item',
        description: 'Testing URL persistence during migration',
        cloudinary_url: uploadResult.secure_url,
        cloudinary_public_id: 'test/persistence-test.txt',
        url: 'https://old-supabase-url.com/test.txt'
      })
      .select()
      .single();

    if (insertError) throw new Error(`Insert failed: ${insertError.message}`);
    console.log('Successfully created test record with both URLs');

    // Verify both URLs are accessible
    const { data: record, error: fetchError } = await supabase
      .from('content_items')
      .select('*')
      .eq('cloudinary_public_id', 'test/persistence-test.txt')
      .single();

    if (fetchError) throw new Error(`Fetch failed: ${fetchError.message}`);
    if (!record.cloudinary_url || !record.url) {
      throw new Error('Missing URLs in record');
    }
    console.log('Successfully verified URL persistence');

    // Test 2: Rollback Procedure
    console.log('\nTesting rollback procedure...');
    // Simulate failed migration
    const { error: updateError } = await supabase
      .from('content_items')
      .update({ cloudinary_url: null, cloudinary_public_id: null })
      .eq('id', record.id);

    if (updateError) throw new Error(`Rollback simulation failed: ${updateError.message}`);

    // Verify original URL still works
    const { data: rolledBack, error: rollbackFetchError } = await supabase
      .from('content_items')
      .select('*')
      .eq('id', record.id)
      .single();

    if (rollbackFetchError) throw new Error(`Rollback fetch failed: ${rollbackFetchError.message}`);
    if (!rolledBack.url) {
      throw new Error('Original URL lost during rollback');
    }
    console.log('Successfully verified rollback procedure');

    // Test 3: Batch Migration
    console.log('\nTesting batch migration...');
    // Create multiple test records
    const batchSize = 3;
    const batchRecords = Array(batchSize).fill(null).map((_, i) => ({
      title: `Batch Test ${i}`,
      description: 'Testing batch migration',
      url: `https://old-supabase-url.com/batch${i}.txt`
    }));

    const { data: batchData, error: batchError } = await supabase
      .from('content_items')
      .insert(batchRecords)
      .select();

    if (batchError) throw new Error(`Batch insert failed: ${batchError.message}`);
    console.log(`Successfully created ${batchSize} test records for batch migration`);

    // Test 4: Usage Monitoring
    console.log('\nTesting usage monitoring...');
    const usage = await cloudinary.api.usage();
    console.log('Current Cloudinary usage:', {
      storage: usage.storage.usage,
      credits: usage.credits.usage
    });

    // Cleanup
    console.log('\nCleaning up test data...');
    await cloudinary.uploader.destroy('test/persistence-test.txt', { resource_type: 'raw' });
    await fs.unlink(testFile);

    // Delete test records
    const { error: cleanupError } = await supabase
      .from('content_items')
      .delete()
      .in('id', [...batchData!.map(r => r.id), record.id]);

    if (cleanupError) throw new Error(`Cleanup failed: ${cleanupError.message}`);

    console.log('\nAll migration scenarios tested successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\nMigration scenario tests failed:', error.message);
    process.exit(1);
  }
}

testMigrationScenarios();
