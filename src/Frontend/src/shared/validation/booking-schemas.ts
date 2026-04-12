import { z } from 'zod';

export const createItinerarySchema = z.object({
  origin: z.string().min(1, 'Origin is required'),
  destination: z.string().min(1, 'Destination is required'),
  travelClass: z.string().default('economy'),
  departureDate: z.string().refine(
    (val) => new Date(val) > new Date(),
    { message: 'Departure date must be in the future' },
  ),
  returnDate: z.string().optional(),
});

export type CreateItineraryInput = z.infer<typeof createItinerarySchema>;

export const createPassengerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  passportNumber: z.string().min(1, 'Passport number is required'),
  dateOfBirth: z.string().refine(
    (val) => new Date(val) < new Date(),
    { message: 'Date of birth must be in the past' },
  ),
});

export type CreatePassengerInput = z.infer<typeof createPassengerSchema>;

export const createBookingSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  totalAmount: z.number().positive('Total amount must be positive'),
  currency: z.string().default('USD'),
  itineraries: z
    .array(createItinerarySchema)
    .min(1, 'At least one itinerary is required'),
  passengers: z
    .array(createPassengerSchema)
    .min(1, 'At least one passenger is required'),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
