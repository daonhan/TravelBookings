import { z } from 'zod';

export const updatePreferencesSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  preferredChannel: z.enum(['Email', 'Sms', 'Push']),
  emailEnabled: z.boolean(),
  smsEnabled: z.boolean(),
  pushEnabled: z.boolean(),
  email: z.string().email('Invalid email address').optional(),
  phoneNumber: z.string().optional(),
});

export type UpdatePreferencesInput = z.infer<typeof updatePreferencesSchema>;
