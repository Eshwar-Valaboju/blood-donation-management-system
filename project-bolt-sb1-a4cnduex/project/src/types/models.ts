export interface User {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  bloodGroup: BloodGroup;
  phone: string;
  email: string;
  address: string;
  password: string;
  isDonor: boolean;
  isReceiver: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Admin {
  id: string;
  username: string;
  password: string;
  email: string;
  createdAt: string;
}

export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export interface Donation {
  id: string;
  userId: string;
  date: string;
  bloodGroup: BloodGroup;
  quantity: number; // in units
  notes?: string;
  createdAt: string;
  collectionCenter: string;
}

export type RequestStatus = 'Pending' | 'Approved' | 'Rejected' | 'Fulfilled';

export interface BloodRequest {
  id: string;
  userId: string;
  bloodGroup: BloodGroup;
  quantity: number;
  requestDate: string;
  status: RequestStatus;
  notes?: string;
  urgency: 'Low' | 'Medium' | 'High';
  deliveryDate?: string;
  hospitalName?: string;
  reason?: string;
}

export interface BloodStock {
  id: string;
  bloodGroup: BloodGroup;
  quantity: number;
  lastUpdated: string;
}

export interface BloodSupply {
  id: string;
  requestId: string;
  userId: string;
  quantity: number;
  bloodGroup: BloodGroup;
  collectionCenter: string;
  supplyDate: string;
  notes?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  admin: Admin | null;
  role: 'user' | 'admin' | null;
}