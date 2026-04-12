export type NotificationChannel = 'Email' | 'Sms' | 'Push';

export type NotificationStatus = 'Pending' | 'Sent' | 'Failed' | 'Delivered';

export type NotificationType =
  | 'BookingConfirmation'
  | 'BookingCancellation'
  | 'PaymentReceipt'
  | 'PaymentFailed'
  | 'EventCreated'
  | 'EventUpdated'
  | 'AttendeeRegistered';

export interface NotificationDto {
  id: string;
  userId: string;
  type: string;
  channel: string;
  status: string;
  subject: string;
  body: string;
  recipient: string | null;
  errorMessage: string | null;
  referenceId: string | null;
  createdAt: string;
  sentAt: string | null;
}

export interface UserPreferenceDto {
  id: string;
  userId: string;
  preferredChannel: string;
  emailEnabled: boolean;
  smsEnabled: boolean;
  pushEnabled: boolean;
  email: string | null;
  phoneNumber: string | null;
}

export interface UpdateUserPreferenceRequest {
  userId: string;
  preferredChannel: NotificationChannel;
  emailEnabled: boolean;
  smsEnabled: boolean;
  pushEnabled: boolean;
  email?: string;
  phoneNumber?: string;
}
