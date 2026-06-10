export interface NotificationPayload {
  id: string;
  channel: string;
  recipient: string;       // email, phone, or userId
  subject: string;
  body: string;
  template?: string;
  templateData?: Record<string, unknown>;
  attachments?: Array<{
    filename: string;
    content: string | Buffer;
    mimeType: string;
  }>;
  priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  scheduledAt?: Date;
  metadata?: Record<string, unknown>;
}

export interface NotificationResult {
  notificationId: string;
  status: string;
  channel: string;
  sentAt?: Date;
  deliveredAt?: Date;
  error?: string;
}
