import { 
  User, 
  Admin, 
  Donation, 
  BloodRequest, 
  BloodStock, 
  BloodSupply,
  Notification
} from '../types/models';
import { 
  initialAdmin, 
  initialUsers, 
  initialDonations, 
  initialRequests, 
  initialBloodStock, 
  initialSupplies,
  initialNotifications
} from './mockData';

// Local storage keys
const KEYS = {
  USERS: 'blood_management_users',
  ADMINS: 'blood_management_admins',
  DONATIONS: 'blood_management_donations',
  REQUESTS: 'blood_management_requests',
  STOCK: 'blood_management_stock',
  SUPPLIES: 'blood_management_supplies',
  NOTIFICATIONS: 'blood_management_notifications',
  AUTH: 'blood_management_auth'
};

// Initialize local storage with mock data if empty
export const initializeLocalStorage = () => {
  if (!localStorage.getItem(KEYS.USERS)) {
    localStorage.setItem(KEYS.USERS, JSON.stringify(initialUsers));
  }
  if (!localStorage.getItem(KEYS.ADMINS)) {
    localStorage.setItem(KEYS.ADMINS, JSON.stringify([initialAdmin]));
  }
  if (!localStorage.getItem(KEYS.DONATIONS)) {
    localStorage.setItem(KEYS.DONATIONS, JSON.stringify(initialDonations));
  }
  if (!localStorage.getItem(KEYS.REQUESTS)) {
    localStorage.setItem(KEYS.REQUESTS, JSON.stringify(initialRequests));
  }
  if (!localStorage.getItem(KEYS.STOCK)) {
    localStorage.setItem(KEYS.STOCK, JSON.stringify(initialBloodStock));
  }
  if (!localStorage.getItem(KEYS.SUPPLIES)) {
    localStorage.setItem(KEYS.SUPPLIES, JSON.stringify(initialSupplies));
  }
  if (!localStorage.getItem(KEYS.NOTIFICATIONS)) {
    localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(initialNotifications));
  }
};

// Generic CRUD functions for local storage
const getItems = <T>(key: string): T[] => {
  const items = localStorage.getItem(key);
  return items ? JSON.parse(items) : [];
};

const setItems = <T>(key: string, items: T[]): void => {
  localStorage.setItem(key, JSON.stringify(items));
};

const addItem = <T extends { id: string }>(key: string, item: T): T => {
  const items = getItems<T>(key);
  items.push(item);
  setItems(key, items);
  return item;
};

const updateItem = <T extends { id: string }>(key: string, updatedItem: T): T | null => {
  const items = getItems<T>(key);
  const index = items.findIndex(item => item.id === updatedItem.id);
  if (index === -1) return null;
  
  items[index] = updatedItem;
  setItems(key, items);
  return updatedItem;
};

const deleteItem = <T extends { id: string }>(key: string, id: string): boolean => {
  const items = getItems<T>(key);
  const newItems = items.filter(item => item.id !== id);
  
  if (newItems.length === items.length) return false;
  
  setItems(key, newItems);
  return true;
};

const getItemById = <T extends { id: string }>(key: string, id: string): T | null => {
  const items = getItems<T>(key);
  return items.find(item => item.id === id) || null;
};

// Specific data access functions
export const userService = {
  getAll: () => getItems<User>(KEYS.USERS),
  getById: (id: string) => getItemById<User>(KEYS.USERS, id),
  add: (user: User) => addItem<User>(KEYS.USERS, user),
  update: (user: User) => updateItem<User>(KEYS.USERS, user),
  delete: (id: string) => deleteItem<User>(KEYS.USERS, id),
  findByEmail: (email: string): User | null => {
    const users = getItems<User>(KEYS.USERS);
    return users.find(user => user.email === email) || null;
  }
};

export const adminService = {
  getAll: () => getItems<Admin>(KEYS.ADMINS),
  getById: (id: string) => getItemById<Admin>(KEYS.ADMINS, id),
  add: (admin: Admin) => addItem<Admin>(KEYS.ADMINS, admin),
  update: (admin: Admin) => updateItem<Admin>(KEYS.ADMINS, admin),
  delete: (id: string) => deleteItem<Admin>(KEYS.ADMINS, id),
  findByUsername: (username: string): Admin | null => {
    const admins = getItems<Admin>(KEYS.ADMINS);
    return admins.find(admin => admin.username === username) || null;
  }
};

export const donationService = {
  getAll: () => getItems<Donation>(KEYS.DONATIONS),
  getById: (id: string) => getItemById<Donation>(KEYS.DONATIONS, id),
  add: (donation: Donation) => addItem<Donation>(KEYS.DONATIONS, donation),
  update: (donation: Donation) => updateItem<Donation>(KEYS.DONATIONS, donation),
  delete: (id: string) => deleteItem<Donation>(KEYS.DONATIONS, id),
  getByUserId: (userId: string): Donation[] => {
    const donations = getItems<Donation>(KEYS.DONATIONS);
    return donations.filter(donation => donation.userId === userId);
  }
};

export const requestService = {
  getAll: () => getItems<BloodRequest>(KEYS.REQUESTS),
  getById: (id: string) => getItemById<BloodRequest>(KEYS.REQUESTS, id),
  add: (request: BloodRequest) => addItem<BloodRequest>(KEYS.REQUESTS, request),
  update: (request: BloodRequest) => updateItem<BloodRequest>(KEYS.REQUESTS, request),
  delete: (id: string) => deleteItem<BloodRequest>(KEYS.REQUESTS, id),
  getByUserId: (userId: string): BloodRequest[] => {
    const requests = getItems<BloodRequest>(KEYS.REQUESTS);
    return requests.filter(request => request.userId === userId);
  },
  getPendingRequests: (): BloodRequest[] => {
    const requests = getItems<BloodRequest>(KEYS.REQUESTS);
    return requests.filter(request => request.status === 'Pending');
  }
};

export const stockService = {
  getAll: () => getItems<BloodStock>(KEYS.STOCK),
  getById: (id: string) => getItemById<BloodStock>(KEYS.STOCK, id),
  update: (stock: BloodStock) => updateItem<BloodStock>(KEYS.STOCK, stock),
  getByBloodGroup: (bloodGroup: string): BloodStock | null => {
    const stocks = getItems<BloodStock>(KEYS.STOCK);
    return stocks.find(stock => stock.bloodGroup === bloodGroup) || null;
  },
  updateQuantity: (bloodGroup: string, changeAmount: number): BloodStock | null => {
    const stocks = getItems<BloodStock>(KEYS.STOCK);
    const stockIndex = stocks.findIndex(stock => stock.bloodGroup === bloodGroup);
    
    if (stockIndex === -1) return null;
    
    // Ensure we don't go below 0
    const newQuantity = Math.max(0, stocks[stockIndex].quantity + changeAmount);
    stocks[stockIndex] = {
      ...stocks[stockIndex],
      quantity: newQuantity,
      lastUpdated: new Date().toISOString()
    };
    
    setItems(KEYS.STOCK, stocks);
    return stocks[stockIndex];
  }
};

export const supplyService = {
  getAll: () => getItems<BloodSupply>(KEYS.SUPPLIES),
  getById: (id: string) => getItemById<BloodSupply>(KEYS.SUPPLIES, id),
  add: (supply: BloodSupply) => addItem<BloodSupply>(KEYS.SUPPLIES, supply),
  update: (supply: BloodSupply) => updateItem<BloodSupply>(KEYS.SUPPLIES, supply),
  delete: (id: string) => deleteItem<BloodSupply>(KEYS.SUPPLIES, id),
  getByRequestId: (requestId: string): BloodSupply | null => {
    const supplies = getItems<BloodSupply>(KEYS.SUPPLIES);
    return supplies.find(supply => supply.requestId === requestId) || null;
  },
  getByUserId: (userId: string): BloodSupply[] => {
    const supplies = getItems<BloodSupply>(KEYS.SUPPLIES);
    return supplies.filter(supply => supply.userId === userId);
  }
};

export const notificationService = {
  getAll: () => getItems<Notification>(KEYS.NOTIFICATIONS),
  getById: (id: string) => getItemById<Notification>(KEYS.NOTIFICATIONS, id),
  add: (notification: Notification) => addItem<Notification>(KEYS.NOTIFICATIONS, notification),
  update: (notification: Notification) => updateItem<Notification>(KEYS.NOTIFICATIONS, notification),
  delete: (id: string) => deleteItem<Notification>(KEYS.NOTIFICATIONS, id),
  getByUserId: (userId: string): Notification[] => {
    const notifications = getItems<Notification>(KEYS.NOTIFICATIONS);
    return notifications.filter(notification => notification.userId === userId);
  },
  markAsRead: (id: string): Notification | null => {
    const notification = getItemById<Notification>(KEYS.NOTIFICATIONS, id);
    if (!notification) return null;
    
    notification.read = true;
    return updateItem(KEYS.NOTIFICATIONS, notification);
  },
  getUnreadCount: (userId: string): number => {
    const notifications = getItems<Notification>(KEYS.NOTIFICATIONS);
    return notifications.filter(n => n.userId === userId && !n.read).length;
  }
};

// Auth service for managing current user session
export const authService = {
  saveAuthState: (authState: { 
    isAuthenticated: boolean;
    user: User | null;
    admin: Admin | null;
    role: 'user' | 'admin' | null;
  }) => {
    localStorage.setItem(KEYS.AUTH, JSON.stringify(authState));
  },
  
  getAuthState: () => {
    const authState = localStorage.getItem(KEYS.AUTH);
    return authState ? JSON.parse(authState) : { 
      isAuthenticated: false, 
      user: null, 
      admin: null, 
      role: null 
    };
  },
  
  logout: () => {
    localStorage.removeItem(KEYS.AUTH);
  },
  
  loginUser: (email: string, password: string) => {
    const user = userService.findByEmail(email);
    if (user && user.password === password) {
      const authState = {
        isAuthenticated: true,
        user,
        admin: null,
        role: 'user' as const
      };
      authService.saveAuthState(authState);
      return authState;
    }
    return null;
  },
  
  loginAdmin: (username: string, password: string) => {
    const admin = adminService.findByUsername(username);
    if (admin && admin.password === password) {
      const authState = {
        isAuthenticated: true,
        user: null,
        admin,
        role: 'admin' as const
      };
      authService.saveAuthState(authState);
      return authState;
    }
    return null;
  }
};