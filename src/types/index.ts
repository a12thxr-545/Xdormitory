export interface User {
  id: string;
  username?: string;
  name: string;
  email: string;
  password?: string;
  phone: string;
  idCard?: string;
  role: 'user' | 'admin';
  authProvider?: 'local' | 'google' | 'line';
  avatarUrl?: string;
  createdAt: string;
}

export interface Dormitory {
  id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  lineId?: string;
  imageUrl: string;
  facilities: string[];
  ownerId: string;
  createdAt: string;
  availableRoomsCount?: number;
  totalRoomsCount?: number;
  minPrice?: number;
  maxPrice?: number;
}

export interface Room {
  id: string;
  dormitoryId: string;
  roomNumber: string;
  floor: number;
  roomType: string;
  price: number;
  deposit: number;
  sizeSqM: number;
  status: 'available' | 'booked' | 'maintenance';
  amenities: string[];
  imageUrl: string;
  createdAt: string;
  dormitoryName?: string;
}

export interface Booking {
  id: string;
  userId: string;
  dormitoryId: string;
  roomId: string;
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  guestIdCard?: string;
  checkInDate: string;
  stayDurationMonths: number;
  specialRequests?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
  confirmedAt?: string;
  cancelledAt?: string;
  cancelReason?: string;
  
  // Joined details for easy rendering
  dormitoryName?: string;
  roomNumber?: string;
  roomType?: string;
  price?: number;
  floor?: number;
}
