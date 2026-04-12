import { describe, it, expect } from 'vitest';
import { createEventSchema } from '../event-schemas';

function validEventData() {
  return {
    organizerId: 'org-001',
    title: 'Tech Conference 2026',
    description: 'Annual technology conference',
    venue: 'Convention Center',
    street: '123 Main St',
    city: 'Sydney',
    state: 'NSW',
    country: 'Australia',
    postalCode: '2000',
    startDate: '2026-06-01T09:00:00Z',
    endDate: '2026-06-03T17:00:00Z',
    capacity: 500,
    categories: 'Technology',
    sessions: [
      {
        title: 'Keynote',
        description: 'Opening keynote speech',
        speaker: 'Jane Smith',
        startTime: '2026-06-01T09:00:00Z',
        endTime: '2026-06-01T10:00:00Z',
        capacity: 500,
      },
    ],
  };
}

describe('createEventSchema', () => {
  it('validates correct event data', () => {
    const result = createEventSchema.safeParse(validEventData());
    expect(result.success).toBe(true);
  });

  it('fails when title is empty', () => {
    const data = { ...validEventData(), title: '' };
    const result = createEventSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages).toContain('Title is required');
    }
  });

  it('fails when title exceeds max length of 200 characters', () => {
    const data = { ...validEventData(), title: 'A'.repeat(201) };
    const result = createEventSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages).toContain('Title must be 200 characters or fewer');
    }
  });

  it('accepts title exactly at 200 characters', () => {
    const data = { ...validEventData(), title: 'A'.repeat(200) };
    const result = createEventSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('fails when capacity is zero', () => {
    const data = { ...validEventData(), capacity: 0 };
    const result = createEventSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages).toContain('Capacity must be a positive integer');
    }
  });

  it('fails when capacity is negative', () => {
    const data = { ...validEventData(), capacity: -10 };
    const result = createEventSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('fails when capacity is a decimal', () => {
    const data = { ...validEventData(), capacity: 10.5 };
    const result = createEventSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('fails when organizerId is empty', () => {
    const data = { ...validEventData(), organizerId: '' };
    const result = createEventSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages).toContain('Organizer ID is required');
    }
  });

  it('fails when venue is empty', () => {
    const data = { ...validEventData(), venue: '' };
    const result = createEventSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages).toContain('Venue is required');
    }
  });

  it('fails when city is empty', () => {
    const data = { ...validEventData(), city: '' };
    const result = createEventSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages).toContain('City is required');
    }
  });

  it('fails when country is empty', () => {
    const data = { ...validEventData(), country: '' };
    const result = createEventSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages).toContain('Country is required');
    }
  });

  it('validates session capacity must be a positive integer', () => {
    const data = validEventData();
    data.sessions[0]!.capacity = 0;
    const result = createEventSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('fails when session title is empty', () => {
    const data = validEventData();
    data.sessions[0]!.title = '';
    const result = createEventSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('fails when session speaker is empty', () => {
    const data = validEventData();
    data.sessions[0]!.speaker = '';
    const result = createEventSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});
