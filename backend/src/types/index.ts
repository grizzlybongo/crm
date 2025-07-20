import { Request } from 'express';
import { Types } from 'mongoose';
import { IClient } from '../models/Client';
import { IInvoice } from '../models/Invoice';
import { IPayment } from '../models/Payment';

export interface IUser {
  _id: Types.ObjectId;
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'client';
  company?: string;
  phone?: string;
  address?: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword: (candidatePassword: string) => Promise<boolean>;
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'admin' | 'client';
  };
}

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'client';
    company?: string;
    phone?: string;
    address?: string;
    avatar?: string;
  };
  token: string;
}

export interface ClientResponse {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  address: string;
  createdAt: string;
  lastActivity: string;
  status: string;
  totalInvoices: number;
  totalPaid: number;
  totalPending: number;
}

export interface InvoiceItemResponse {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface InvoiceResponse {
  id: string;
  number: string;
  clientId: string;
  clientName: string;
  date: string;
  dueDate: string;
  status: string;
  items: InvoiceItemResponse[];
  subtotal: number;
  tax: number;
  total: number;
  notes?: string;
}

export interface PaymentResponse {
  id: string;
  invoiceId: string;
  clientId: string;
  clientName: string;
  amount: number;
  date: string;
  method: string;
  status: string;
  reference?: string;
  notes?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: any;
} 