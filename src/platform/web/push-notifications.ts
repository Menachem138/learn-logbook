export interface PushNotificationSchema {
  title?: string;
  subtitle?: string;
  body?: string;
  id: string;
  badge?: number;
  notification?: any;
  data?: any;
  click_action?: string;
  link?: string;
  group?: string;
}

export interface PushNotificationActionPerformed {
  actionId: string;
  inputValue?: string;
  notification: PushNotificationSchema;
}

export interface PushNotificationToken {
  value: string;
}

export interface PushNotificationDeliveredList {
  notifications: PushNotificationSchema[];
}

export interface PushNotificationChannel {
  id: string;
  name: string;
  description?: string;
  sound?: string;
  importance?: number;
  visibility?: number;
  lights?: boolean;
  lightColor?: string;
  vibration?: boolean;
}

export interface PushNotificationChannelList {
  channels: PushNotificationChannel[];
}

export interface PermissionStatus {
  receive: 'prompt' | 'prompt-with-rationale' | 'granted' | 'denied';
}

export const PushNotifications = {
  addListener: (eventName: string, listenerFunc: (event: any) => void) => ({
    remove: () => {
      console.log('Web mock: Removing push notification listener');
    }
  }),

  async register(): Promise<void> {
    console.log('Web mock: PushNotifications.register');
    if ('Notification' in window) {
      await Notification.requestPermission();
    }
  },

  async getDeliveredNotifications(): Promise<PushNotificationDeliveredList> {
    console.log('Web mock: PushNotifications.getDeliveredNotifications');
    return { notifications: [] };
  },

  async removeDeliveredNotifications(notifications: PushNotificationSchema[]): Promise<void> {
    console.log('Web mock: PushNotifications.removeDeliveredNotifications', notifications);
  },

  async removeAllDeliveredNotifications(): Promise<void> {
    console.log('Web mock: PushNotifications.removeAllDeliveredNotifications');
  },

  async createChannel(channel: PushNotificationChannel): Promise<void> {
    console.log('Web mock: PushNotifications.createChannel', channel);
  },

  async deleteChannel(channelId: string): Promise<void> {
    console.log('Web mock: PushNotifications.deleteChannel', channelId);
  },

  async listChannels(): Promise<PushNotificationChannelList> {
    console.log('Web mock: PushNotifications.listChannels');
    return { channels: [] };
  },

  async checkPermissions(): Promise<PermissionStatus> {
    console.log('Web mock: PushNotifications.checkPermissions');
    if ('Notification' in window) {
      const permission = Notification.permission;
      return { receive: permission === 'granted' ? 'granted' : 'prompt' };
    }
    return { receive: 'denied' };
  },

  async requestPermissions(): Promise<PermissionStatus> {
    console.log('Web mock: PushNotifications.requestPermissions');
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return { receive: permission === 'granted' ? 'granted' : 'denied' };
    }
    return { receive: 'denied' };
  }
};

export default PushNotifications;
