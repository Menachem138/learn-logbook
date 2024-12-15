-- Add image_url column to learning_journal table
alter table public.learning_journal
add column if not exists image_url text;
