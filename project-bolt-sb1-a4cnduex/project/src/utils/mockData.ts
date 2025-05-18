import { v4 as uuidv4 } from 'uuid';
import { 
  User, 
  Admin, 
  Donation, 
  BloodRequest, 
  BloodStock, 
  BloodSupply,
  BloodGroup,
  Notification
} from '../types/models';
import { formatISO } from 'date-fns';

const BLOOD_GROUPS: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// Generate initial blood stock
export const initialBloodStock: BloodStock[] = BLOOD_GROUPS.map(group => ({
  id: uuidv4(),
  bloodGroup: group,
  quantity: Math.floor(Math.random() * 20) + 5, // Random between 5-25 units
  lastUpdated: formatISO(new Date())
}));

// Demo admin
export const initialAdmin: Admin = {
  id: uuidv4(),
  username: 'admin',
  password: 'admin123', // In a real app, this would be hashed
  email: 'admin@bloodbank.com',
  createdAt: formatISO(new Date())
};

// Demo users
export const initialUsers: User[] = [
  {
    id: uuidv4(),
    name: 'John Doe',
    age: 28,
    gender: 'Male',
    bloodGroup: 'O+',
    phone: '555-123-4567',
    email: 'john@example.com',
    address: '123 Main St, City',
    password: 'password',
    isDonor: true,
    isReceiver: true,
    createdAt: formatISO(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)), // 30 days ago
    updatedAt: formatISO(new Date())
  },
  {
    id: uuidv4(),
    name: 'Jane Smith',
    age: 35,
    gender: 'Female',
    bloodGroup: 'A+',
    phone: '555-987-6543',
    email: 'jane@example.com',
    address: '456 Elm St, Town',
    password: 'password',
    isDonor: true,
    isReceiver: false,
    createdAt: formatISO(new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)), // 60 days ago
    updatedAt: formatISO(new Date())
  }
];

// Past 3 months for donations
const pastMonths = Array.from({ length: 3 }, (_, i) => 
  new Date(new Date().setMonth(new Date().getMonth() - i))
);

// Generate sample donations
export const initialDonations: Donation[] = [
  ...Array.from({ length: 8 }, (_, i) => ({
    id: uuidv4(),
    userId: initialUsers[0].id,
    date: formatISO(new Date(pastMonths[Math.floor(i / 3)].getTime() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000)),
    bloodGroup: initialUsers[0].bloodGroup,
    quantity: 1,
    notes: i % 2 === 0 ? 'Regular donation' : undefined,
    createdAt: formatISO(new Date(pastMonths[Math.floor(i / 3)])),
    collectionCenter: i % 2 === 0 ? 'Central Blood Bank' : 'City Hospital'
  })),
  ...Array.from({ length: 5 }, (_, i) => ({
    id: uuidv4(),
    userId: initialUsers[1].id,
    date: formatISO(new Date(pastMonths[Math.floor(i / 2)].getTime() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000)),
    bloodGroup: initialUsers[1].bloodGroup,
    quantity: 1,
    notes: i % 2 === 0 ? 'First time donor' : undefined,
    createdAt: formatISO(new Date(pastMonths[Math.floor(i / 2)])),
    collectionCenter: i % 2 === 0 ? 'Central Blood Bank' : 'Medical Center'
  }))
];

// Sample blood requests
export const initialRequests: BloodRequest[] = [
  {
    id: uuidv4(),
    userId: initialUsers[0].id,
    bloodGroup: 'A+',
    quantity: 2,
    requestDate: formatISO(new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)),
    status: 'Fulfilled',
    urgency: 'Medium',
    deliveryDate: formatISO(new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)),
    hospitalName: 'General Hospital',
    reason: 'Surgery'
  },
  {
    id: uuidv4(),
    userId: initialUsers[0].id,
    bloodGroup: 'O-',
    quantity: 1,
    requestDate: formatISO(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)),
    status: 'Pending',
    urgency: 'High',
    hospitalName: 'St. Mary Hospital',
    reason: 'Emergency'
  },
  {
    id: uuidv4(),
    userId: initialUsers[1].id,
    bloodGroup: 'B+',
    quantity: 3,
    requestDate: formatISO(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)),
    status: 'Approved',
    urgency: 'Medium',
    deliveryDate: formatISO(new Date()),
    hospitalName: 'City Medical Center',
    reason: 'Transfusion'
  }
];

// Generate sample blood supplies
export const initialSupplies: BloodSupply[] = [
  {
    id: uuidv4(),
    requestId: initialRequests[0].id,
    userId: initialRequests[0].userId,
    quantity: initialRequests[0].quantity,
    bloodGroup: initialRequests[0].bloodGroup,
    collectionCenter: 'Central Blood Bank',
    supplyDate: formatISO(new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)),
    notes: 'Supplied for surgery'
  }
];

// Sample notifications
export const initialNotifications: Notification[] = [
  {
    id: uuidv4(),
    userId: initialUsers[0].id,
    title: 'Blood Request Approved',
    message: 'Your blood request has been approved and will be fulfilled soon.',
    type: 'success',
    read: false,
    createdAt: formatISO(new Date(Date.now() - 1 * 24 * 60 * 60 * 1000))
  },
  {
    id: uuidv4(),
    userId: initialUsers[0].id,
    title: 'Donation Reminder',
    message: 'You are now eligible to donate blood again. Your last donation was 3 months ago.',
    type: 'info',
    read: true,
    createdAt: formatISO(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000))
  },
  {
    id: uuidv4(),
    userId: initialUsers[1].id,
    title: 'Thank You for Donating',
    message: 'Thank you for your recent blood donation. You have helped save lives!',
    type: 'success',
    read: false,
    createdAt: formatISO(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000))
  }
];