import { supabase } from '../integrations/supabase/client';
import type { Database } from '../integrations/supabase/types';

type NotificationToken = Database['public']['Tables']['notification_tokens']['Row'];

export async function saveNotificationToken(expoToken: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data: existingToken } = await supabase
    .from('notification_tokens')
    .select()
    .eq('user_id', user.id)
    .single();

  if (existingToken) {
    await supabase
      .from('notification_tokens')
      .update({ expo_token: expoToken, updated_at: new Date().toISOString() })
      .eq('id', existingToken.id);
  } else {
    await supabase
      .from('notification_tokens')
      .insert({
        user_id: user.id,
        expo_token: expoToken,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
  }
}

export async function deleteNotificationToken(expoToken: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from('notification_tokens')
    .delete()
    .eq('user_id', user.id)
    .eq('expo_token', expoToken);
}
