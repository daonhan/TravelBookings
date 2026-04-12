import { z } from 'zod';

export const createSessionSchema = z.object({
  title: z.string().min(1, 'Session title is required'),
  description: z.string(),
  speaker: z.string().min(1, 'Speaker is required'),
  startTime: z.string(),
  endTime: z.string(),
  capacity: z.number().int().positive('Capacity must be a positive integer'),
});

export type CreateSessionInput = z.infer<typeof createSessionSchema>;

export const createEventSchema = z.object({
  organizerId: z.string().min(1, 'Organizer ID is required'),
  title: z.string().min(1, 'Title is required').max(200, 'Title must be 200 characters or fewer'),
  description: z.string(),
  venue: z.string().min(1, 'Venue is required'),
  street: z.string(),
  city: z.string().min(1, 'City is required'),
  state: z.string(),
  country: z.string().min(1, 'Country is required'),
  postalCode: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  capacity: z.number().int().positive('Capacity must be a positive integer'),
  categories: z.string(),
  sessions: z.array(createSessionSchema),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;

export const updateEventSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be 200 characters or fewer'),
  description: z.string(),
  venue: z.string().min(1, 'Venue is required'),
  street: z.string(),
  city: z.string().min(1, 'City is required'),
  state: z.string(),
  country: z.string().min(1, 'Country is required'),
  postalCode: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  capacity: z.number().int().positive('Capacity must be a positive integer'),
  categories: z.string(),
});

export type UpdateEventInput = z.infer<typeof updateEventSchema>;

export const registerAttendeeSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  attendeeName: z.string().min(1, 'Attendee name is required'),
  registrationType: z.string().default('Standard'),
  sessionPreferences: z.string().optional(),
});

export type RegisterAttendeeInput = z.infer<typeof registerAttendeeSchema>;
