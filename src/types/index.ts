export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'student' | 'club-admin' | 'admin';
  department?: string;
  year?: number;
  avatar?: string;
  registeredEvents?: string[];
  clubId?: string;
}

export interface Club {
  _id: string;
  name: string;
  description: string;
  logo: string;
  coverImage: string;
  category: string;
  foundedYear: number;
  members: number;
  adminId: string | { _id: string; name: string; email: string };
  socialLinks?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    website?: string;
  };
  events?: string[];
  announcements?: Announcement[];
}

export interface Event {
  _id: string;
  title: string;
  description: string;
  clubId: string | { _id: string; name: string; logo: string };
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  image: string;
  category: string;
  status: 'upcoming' | 'ongoing' | 'past';
  registeredUsers: string[];
  maxParticipants?: number;
  feedback?: Feedback[];
  registrationFormUrl?: string;
}

export interface Announcement {
  _id: string;
  clubId: string;
  title: string;
  content: string;
  date: string;
  important: boolean;
}

export interface Feedback {
  id: string;
  userId: string;
  eventId: string;
  rating: number;
  comment: string;
  date: string;
}