import mongoose, { Schema } from 'mongoose';

export interface IClient {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  company: string;
  address: string;
  createdAt: Date;
  lastActivity: Date;
  status: 'active' | 'inactive';
  totalInvoices: number;
  totalPaid: number;
  totalPending: number;
}

const clientSchema = new Schema<IClient>(
  {
    name: {
      type: String,
      required: [true, 'Please provide client name']
    },
    email: {
      type: String,
      required: [true, 'Please provide client email'],
      unique: true,
      lowercase: true
    },
    phone: {
      type: String
    },
    company: {
      type: String
    },
    address: {
      type: String
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
    },
    totalInvoices: {
      type: Number,
      default: 0
    },
    totalPaid: {
      type: Number,
      default: 0
    },
    totalPending: {
      type: Number,
      default: 0
    },
    lastActivity: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
  }
);

const Client = mongoose.model<IClient>('Client', clientSchema);

export default Client; 