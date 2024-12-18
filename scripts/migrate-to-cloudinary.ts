import { createClient } from '@supabase/supabase-js';
import { initCloudinary, uploadFileToCloudinary } from '../src/utils/cloudinaryStorage';
import fs from 'fs';
import path from 'path';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Batch size for processing
const BATCH_SIZE = 10;

// Backup data to JSON files
async function backupData() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(__dirname, '../backups', timestamp);

  // Create backup directory
  fs.mkdirSync(backupDir, { recursive: true });

  // Backup content_items
  const { data: contentItems } = await supabase
    .from('content_items')
    .select('*')
    .not('file_path', 'is', null);

  if (contentItems) {
    fs.writeFileSync(
      path.join(backupDir, 'content_items.json'),
      JSON.stringify(contentItems, null, 2)
    );
  }

  // Backup library_items
  const { data: libraryItems } = await supabase
    .from('library_items')
    .select('*')
    .not('file_details', 'is', null);

  if (libraryItems) {
    fs.writeFileSync(
      path.join(backupDir, 'library_items.json'),
      JSON.stringify(libraryItems, null, 2)
    );
  }

  return backupDir;
}

// Process items in batches
async function processBatch<T>(
  items: T[],
  processItem: (item: T) => Promise<void>,
  startIndex: number
): Promise<number> {
  const endIndex = Math.min(startIndex + BATCH_SIZE, items.length);
  const batch = items.slice(startIndex, endIndex);

  console.log(`Processing batch ${startIndex}-${endIndex} of ${items.length} items`);

  for (const item of batch) {
    try {
      await processItem(item);
    } catch (error) {
      console.error('Error processing item:', error);
      // Continue with next item
    }
  }

  return endIndex;
}

// Migrate content items
async function migrateContentItems() {
  const { data: contentItems } = await supabase
    .from('content_items')
    .select('*')
    .not('file_path', 'is', null);

  if (!contentItems?.length) {
    console.log('No content items to migrate');
    return;
  }

  let processedCount = 0;
  while (processedCount < contentItems.length) {
    processedCount = await processBatch(
      contentItems,
      async (item) => {
        // Download file from Supabase
        const { data, error } = await supabase.storage
          .from('content_library')
          .download(item.file_path!);

        if (error || !data) {
          throw new Error(`Failed to download file: ${error?.message}`);
        }

        // Convert to File object
        const file = new File([data], item.file_name!, {
          type: item.mime_type || undefined
        });

        // Upload to Cloudinary
        const result = await uploadFileToCloudinary(file, item.user_id);

        // Update database record
        await supabase
          .from('content_items')
          .update({
            cloudinary_public_id: result.filePath,
            cloudinary_url: result.publicUrl
          })
          .eq('id', item.id);
      },
      processedCount
    );
  }
}

// Migrate library items
async function migrateLibraryItems() {
  const { data: libraryItems } = await supabase
    .from('library_items')
    .select('*')
    .not('file_details', 'is', null);

  if (!libraryItems?.length) {
    console.log('No library items to migrate');
    return;
  }

  let processedCount = 0;
  while (processedCount < libraryItems.length) {
    processedCount = await processBatch(
      libraryItems,
      async (item) => {
        if (!item.file_details?.path) return;

        // Download file from Supabase
        const { data, error } = await supabase.storage
          .from('content_library')
          .download(item.file_details.path);

        if (error || !data) {
          throw new Error(`Failed to download file: ${error?.message}`);
        }

        // Convert to File object
        const file = new File([data], item.file_details.name || 'unknown', {
          type: item.file_details.type
        });

        // Upload to Cloudinary
        const result = await uploadFileToCloudinary(file, item.user_id);

        // Update database record
        await supabase
          .from('library_items')
          .update({
            cloudinary_data: {
              ...item.file_details,
              cloudinary_public_id: result.filePath,
              cloudinary_url: result.publicUrl
            }
          })
          .eq('id', item.id);
      },
      processedCount
    );
  }
}

// Main migration function
async function migrate() {
  try {
    console.log('Starting migration process...');

    // Initialize Cloudinary
    initCloudinary();

    // Create backup
    console.log('Creating backup...');
    const backupDir = await backupData();
    console.log(`Backup created in ${backupDir}`);

    // Migrate content items
    console.log('Migrating content items...');
    await migrateContentItems();

    // Migrate library items
    console.log('Migrating library items...');
    await migrateLibraryItems();

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Verify migration success
async function verifyMigration() {
  console.log('Verifying migration...');

  // Verify content_items
  const { data: contentItems, error: contentError } = await supabase
    .from('content_items')
    .select('id, file_path, cloudinary_url, cloudinary_public_id')
    .not('file_path', 'is', null);

  if (contentError) {
    throw new Error(`Failed to verify content items: ${contentError.message}`);
  }

  const contentItemsWithoutCloudinary = contentItems?.filter(
    item => !item.cloudinary_url || !item.cloudinary_public_id
  ) || [];

  // Verify library_items
  const { data: libraryItems, error: libraryError } = await supabase
    .from('library_items')
    .select('id, file_details, cloudinary_data')
    .not('file_details', 'is', null);

  if (libraryError) {
    throw new Error(`Failed to verify library items: ${libraryError.message}`);
  }

  const libraryItemsWithoutCloudinary = libraryItems?.filter(
    item => !item.cloudinary_data?.cloudinary_url || !item.cloudinary_data?.cloudinary_public_id
  ) || [];

  // Report verification results
  const verificationResults = {
    contentItems: {
      total: contentItems?.length || 0,
      migrated: (contentItems?.length || 0) - contentItemsWithoutCloudinary.length,
      pending: contentItemsWithoutCloudinary.length,
      pendingIds: contentItemsWithoutCloudinary.map(item => item.id)
    },
    libraryItems: {
      total: libraryItems?.length || 0,
      migrated: (libraryItems?.length || 0) - libraryItemsWithoutCloudinary.length,
      pending: libraryItemsWithoutCloudinary.length,
      pendingIds: libraryItemsWithoutCloudinary.map(item => item.id)
    }
  };

  console.log('Migration verification results:', JSON.stringify(verificationResults, null, 2));

  return verificationResults;
}

// Run migration if called directly
if (require.main === module) {
  migrate().then(() => verifyMigration());
}

export { migrate, backupData, verifyMigration };
