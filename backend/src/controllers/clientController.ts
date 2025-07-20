import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Client from '../models/Client';
import User from '../models/User';
import { AppError, sendSuccessResponse } from '../utils/errorHandler';
import { AuthRequest, ClientResponse } from '../types';
import bcrypt from 'bcryptjs';

// Map MongoDB document to frontend Client response
const mapClientToResponse = (client: any): ClientResponse => {
  return {
    id: client._id.toString(),
    name: client.name,
    email: client.email,
    phone: client.phone || '',
    company: client.company || '',
    address: client.address || '',
    createdAt: client.createdAt.toISOString().split('T')[0],
    lastActivity: client.lastActivity.toISOString().split('T')[0],
    status: client.status,
    totalInvoices: client.totalInvoices,
    totalPaid: client.totalPaid,
    totalPending: client.totalPending
  };
};

// Get all clients
export const getAllClients = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return next(new AppError('Not authorized to access clients', 403));
    }

    const clients = await Client.find();
    const clientResponses = clients.map(mapClientToResponse);

    sendSuccessResponse(res, clientResponses, 'Clients retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// Get client by ID
export const getClientById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return next(new AppError('Not authorized to access clients', 403));
    }

    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new AppError('Invalid client ID', 400));
    }

    const client = await Client.findById(id);
    
    if (!client) {
      return next(new AppError('Client not found', 404));
    }

    sendSuccessResponse(res, mapClientToResponse(client), 'Client retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// Create a new client
export const createClient = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return next(new AppError('Not authorized to create clients', 403));
    }

    const { name, email, phone, company, address, createAccount, password } = req.body;

    // Check if client with this email already exists
    const existingClient = await Client.findOne({ email });
    if (existingClient) {
      return next(new AppError('Client with this email already exists', 400));
    }

    // Create client
    const client = await Client.create({
      name,
      email,
      phone,
      company,
      address,
      status: 'active',
      lastActivity: new Date()
    });

    // If createAccount is true, create a user account for the client
    if (createAccount && password) {
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return next(new AppError('User with this email already exists', 400));
      }

      // Create user
      await User.create({
        email,
        password,
        name,
        company,
        phone,
        address,
        role: 'client'
      });
    }

    sendSuccessResponse(res, mapClientToResponse(client), 'Client created successfully', 201);
  } catch (error) {
    next(error);
  }
};

// Update client
export const updateClient = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return next(new AppError('Not authorized to update clients', 403));
    }

    const { id } = req.params;
    const { name, email, phone, company, address, status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new AppError('Invalid client ID', 400));
    }

    // If email is being changed, check if new email is already taken
    if (email) {
      const existingClient = await Client.findOne({ email, _id: { $ne: id } });
      if (existingClient) {
        return next(new AppError('Client with this email already exists', 400));
      }
    }

    const updatedClient = await Client.findByIdAndUpdate(
      id,
      { name, email, phone, company, address, status, lastActivity: new Date() },
      { new: true, runValidators: true }
    );

    if (!updatedClient) {
      return next(new AppError('Client not found', 404));
    }

    // If client has a user account, update user data as well
    const user = await User.findOne({ email: updatedClient.email, role: 'client' });
    if (user) {
      await User.findByIdAndUpdate(
        user._id,
        { name, company, phone, address },
        { new: true, runValidators: true }
      );
    }

    sendSuccessResponse(res, mapClientToResponse(updatedClient), 'Client updated successfully');
  } catch (error) {
    next(error);
  }
};

// Delete client
export const deleteClient = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return next(new AppError('Not authorized to delete clients', 403));
    }

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new AppError('Invalid client ID', 400));
    }

    const client = await Client.findById(id);
    if (!client) {
      return next(new AppError('Client not found', 404));
    }

    // Check if client has invoices or payments before deleting
    // For now, we'll just delete without checking

    await Client.findByIdAndDelete(id);

    // Delete associated user account if exists
    await User.findOneAndDelete({ email: client.email, role: 'client' });

    sendSuccessResponse(res, null, 'Client deleted successfully');
  } catch (error) {
    next(error);
  }
};

// Import clients from external MongoDB collection
export const importClientsFromMongoDB = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return next(new AppError('Not authorized to import clients', 403));
    }

    // This would normally connect to another MongoDB collection
    // For demonstration purposes, we'll simulate this by using mock data
    // In a real implementation, you would use mongoose to connect to the external DB

    const { createAccounts, defaultPassword } = req.body;
    
    // Normally, you would use mongoose.createConnection to connect to a different database
    // const externalDb = mongoose.createConnection('mongodb://localhost:27017/erp_pro');
    // const ExternalUser = externalDb.model('users', new mongoose.Schema({}, { strict: false }));
    // const externalUsers = await ExternalUser.find({});

    // Mock external users
    const externalUsers = [
      {
        name: 'Imported User 1',
        email: 'imported1@example.com',
        company: 'Imported Company 1',
        phone: '216-12345678',
        address: 'Tunis, Tunisia'
      },
      {
        name: 'Imported User 2',
        email: 'imported2@example.com',
        company: 'Imported Company 2',
        phone: '216-87654321',
        address: 'Sfax, Tunisia'
      }
    ];

    const results = {
      total: externalUsers.length,
      created: 0,
      skipped: 0,
      errors: [] as string[]
    };

    for (const externalUser of externalUsers) {
      try {
        // Check if client already exists
        const existingClient = await Client.findOne({ email: externalUser.email });
        
        if (existingClient) {
          results.skipped++;
          continue;
        }

        // Create client
        const client = await Client.create({
          name: externalUser.name,
          email: externalUser.email,
          phone: externalUser.phone || '',
          company: externalUser.company || '',
          address: externalUser.address || '',
          status: 'active',
          lastActivity: new Date()
        });

        // If createAccounts is true, create a user account for each imported client
        if (createAccounts && defaultPassword) {
          const existingUser = await User.findOne({ email: externalUser.email });
          
          if (!existingUser) {
            await User.create({
              email: externalUser.email,
              password: defaultPassword,
              name: externalUser.name,
              company: externalUser.company,
              phone: externalUser.phone,
              address: externalUser.address,
              role: 'client'
            });
          }
        }

        results.created++;
      } catch (error: any) {
        results.errors.push(`Error importing ${externalUser.email}: ${error.message}`);
      }
    }

    sendSuccessResponse(res, results, 'Client import completed');
  } catch (error) {
    next(error);
  }
};

// Create user account for existing client
export const createClientAccount = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return next(new AppError('Not authorized to create client accounts', 403));
    }

    const { clientId, password } = req.body;

    if (!mongoose.Types.ObjectId.isValid(clientId)) {
      return next(new AppError('Invalid client ID', 400));
    }

    if (!password || password.length < 8) {
      return next(new AppError('Password must be at least 8 characters long', 400));
    }

    const client = await Client.findById(clientId);
    
    if (!client) {
      return next(new AppError('Client not found', 404));
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: client.email });
    if (existingUser) {
      return next(new AppError('User account already exists for this client', 400));
    }

    // Create user
    const newUser = await User.create({
      email: client.email,
      password,
      name: client.name,
      company: client.company,
      phone: client.phone,
      address: client.address,
      role: 'client'
    });

    sendSuccessResponse(res, { userId: newUser._id }, 'Client account created successfully', 201);
  } catch (error) {
    next(error);
  }
}; 