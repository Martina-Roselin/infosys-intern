export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  location: string;
}

export interface Provider {
  id: number;
  name: string;
  email: string;
  phone: string;
  serviceType: string;
  experienceYears: number;
  serviceCost: number;
  location: string;
  availability: string;
}

export interface Booking {
  id: number;
  dateOfService: string;
  timeSlot: string;
  status: string;
  user: User;
  serviceProvider: Provider;
}
