export type EventStatus = 'Draft' | 'Published' | 'InProgress' | 'Completed' | 'Cancelled';

export type RegistrationStatus = 'Pending' | 'Confirmed' | 'Cancelled' | 'WaitListed';

export type RegistrationType = 'Standard' | 'VIP' | 'Speaker' | 'Organizer';

export interface EventDto {
  id: string;
  organizerId: string;
  title: string;
  description: string;
  venue: string;
  city: string;
  country: string;
  startDate: string;
  endDate: string;
  capacity: number;
  availableCapacity: number;
  status: EventStatus;
  categories: string;
  createdAt: string;
  sessions: SessionDto[];
  registrations: RegistrationDto[];
}

export interface SessionDto {
  id: string;
  title: string;
  speaker: string;
  startTime: string;
  endTime: string;
  capacity: number;
}

export interface RegistrationDto {
  id: string;
  userId: string;
  attendeeName: string;
  registrationType: string;
  status: string;
  registeredAt: string;
}

export interface CreateEventRequest {
  organizerId: string;
  title: string;
  description: string;
  venue: string;
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  startDate: string;
  endDate: string;
  capacity: number;
  categories: string;
  sessions: CreateSessionRequest[];
}

export interface CreateSessionRequest {
  title: string;
  description: string;
  speaker: string;
  startTime: string;
  endTime: string;
  capacity: number;
}

export interface UpdateEventRequest {
  title: string;
  description: string;
  venue: string;
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  startDate: string;
  endDate: string;
  capacity: number;
  categories: string;
}

export interface RegisterAttendeeRequest {
  userId: string;
  attendeeName: string;
  registrationType: string;
  sessionPreferences?: string;
}

export interface SearchEventsParams {
  organizerId?: string;
  title?: string;
  location?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  pageSize?: number;
}
