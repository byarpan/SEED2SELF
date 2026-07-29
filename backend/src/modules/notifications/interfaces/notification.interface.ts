export interface NotificationResponse {
  id: string;
  notificationId: string;
  userId: string;
  role: string;
  title: string;
  message: string;
  notificationType: string;
  referenceType?: string;
  referenceId?: string;
  clickDestination?: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationListResponse {
  notifications: NotificationResponse[];
  total: number;
  unreadCount: number;
  page?: number;
  limit?: number;
}

export interface UnreadCountResponse {
  unreadCount: number;
}
