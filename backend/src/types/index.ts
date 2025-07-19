export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'client';
  company?: string;
  avatar?: string;
  phone?: string;
  address?: string;
  isActive: boolean;
  emailVerified: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Client {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  address: string;
  status: 'active' | 'inactive';
  totalInvoices: number;
  totalPaid: number;
  totalPending: number;
  lastActivity: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Invoice {
  id: string;
  number: string;
  clientId: string;
  date: Date;
  dueDate: Date;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  subtotal: number;
  tax: number;
  total: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  createdAt: Date;
}

export interface Quote {
  id: string;
  number: string;
  clientId: string;
  date: Date;
  validUntil: Date;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  subtotal: number;
  tax: number;
  total: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface QuoteItem {
  id: string;
  quoteId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  createdAt: Date;
}

export interface Payment {
  id: string;
  invoiceId: string;
  clientId: string;
  amount: number;
  date: Date;
  method: 'bank_transfer' | 'check' | 'cash' | 'card';
  status: 'pending' | 'completed' | 'failed';
  reference?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: 'text' | 'file';
  fileName?: string;
  filePath?: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: Date;
}

export interface Document {
  id: string;
  userId: string;
  name: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  category: 'contract' | 'invoice' | 'report' | 'other';
  status: 'active' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

export interface Appointment {
  id: string;
  clientId: string;
  title: string;
  description?: string;
  date: Date;
  time: string;
  type: 'presential' | 'video' | 'phone';
  status: 'scheduled' | 'completed' | 'cancelled';
  location?: string;
  meetingUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  company?: string;
  phone?: string;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}