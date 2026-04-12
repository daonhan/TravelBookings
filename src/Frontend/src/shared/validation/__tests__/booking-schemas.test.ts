import { describe, it, expect } from 'vitest';
import { createBookingSchema } from '../booking-schemas';

function validBookingData() {
  // Departure date must be in the future
  const futureDate = new Date();
  futureDate.setFullYear(futureDate.getFullYear() + 1);

  // Date of birth must be in the past
  const pastDate = new Date('1990-01-15');

  return {
    userId: 'user-123',
    totalAmount: 499.99,
    currency: 'USD',
    itineraries: [
      {
        origin: 'SYD',
        destination: 'LAX',
        travelClass: 'economy',
        departureDate: futureDate.toISOString(),
      },
    ],
    passengers: [
      {
        firstName: 'John',
        lastName: 'Doe',
        passportNumber: 'AB1234567',
        dateOfBirth: pastDate.toISOString(),
      },
    ],
  };
}

describe('createBookingSchema', () => {
  it('validates correct booking data', () => {
    const result = createBookingSchema.safeParse(validBookingData());
    expect(result.success).toBe(true);
  });

  it('fails when userId is missing', () => {
    const data = { ...validBookingData(), userId: '' };
    const result = createBookingSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages).toContain('User ID is required');
    }
  });

  it('fails when totalAmount is missing', () => {
    const { totalAmount: _removed, ...data } = validBookingData();
    const result = createBookingSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('fails when totalAmount is zero', () => {
    const data = { ...validBookingData(), totalAmount: 0 };
    const result = createBookingSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages).toContain('Total amount must be positive');
    }
  });

  it('fails when totalAmount is negative', () => {
    const data = { ...validBookingData(), totalAmount: -10 };
    const result = createBookingSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages).toContain('Total amount must be positive');
    }
  });

  it('requires at least one itinerary', () => {
    const data = { ...validBookingData(), itineraries: [] };
    const result = createBookingSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages).toContain('At least one itinerary is required');
    }
  });

  it('requires at least one passenger', () => {
    const data = { ...validBookingData(), passengers: [] };
    const result = createBookingSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages).toContain('At least one passenger is required');
    }
  });

  it('fails when itinerary origin is empty', () => {
    const data = validBookingData();
    data.itineraries[0]!.origin = '';
    const result = createBookingSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages).toContain('Origin is required');
    }
  });

  it('fails when itinerary destination is empty', () => {
    const data = validBookingData();
    data.itineraries[0]!.destination = '';
    const result = createBookingSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages).toContain('Destination is required');
    }
  });

  it('fails when passenger firstName is empty', () => {
    const data = validBookingData();
    data.passengers[0]!.firstName = '';
    const result = createBookingSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages).toContain('First name is required');
    }
  });

  it('defaults currency to USD when not provided', () => {
    const { currency: _removed, ...data } = validBookingData();
    const result = createBookingSchema.safeParse(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.currency).toBe('USD');
    }
  });

  it('accepts multiple itineraries and passengers', () => {
    const data = validBookingData();
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    futureDate.setMonth(futureDate.getMonth() + 1);

    data.itineraries.push({
      origin: 'LAX',
      destination: 'JFK',
      travelClass: 'business',
      departureDate: futureDate.toISOString(),
    });
    data.passengers.push({
      firstName: 'Jane',
      lastName: 'Doe',
      passportNumber: 'CD7654321',
      dateOfBirth: '1992-05-20T00:00:00Z',
    });

    const result = createBookingSchema.safeParse(data);
    expect(result.success).toBe(true);
  });
});
