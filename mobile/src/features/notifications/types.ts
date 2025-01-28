export interface NotificationToken {
  id: string;
  user_id: string;
  token: string;
  device_id: string;
  created_at: string;
  updated_at: string;
}

export interface PushNotification {
  id: string;
  user_id: string;
  event_id: string;
  event_type: string;
  message: string;
  scheduled_for: string;
  is_sent: boolean;
  created_at: string;
  updated_at: string;
}

export type NotificationPermissionStatus = 'granted' | 'denied' | 'undetermined';
