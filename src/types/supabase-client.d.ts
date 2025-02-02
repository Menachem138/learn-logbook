declare module '@/integrations/supabase/client' {
  import { SupabaseClient, User } from '@supabase/supabase-js';
  import type { Database } from '@/types/supabase.generated';
  
  export const supabase: SupabaseClient<Database>;
  export type { User };
  export type Tables = Database['public']['Tables'];
}
