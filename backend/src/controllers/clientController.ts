import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../config/database';
import { sendSuccess, sendError } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';
import { Client, PaginationQuery } from '../types';

export const getClients = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'desc' }: PaginationQuery = req.query;
    const db = getDatabase();

    let query = 'SELECT * FROM clients WHERE 1=1';
    const params: any[] = [];

    // Add search filter
    if (search) {
      query += ' AND (name LIKE ? OR email LIKE ? OR company LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    // Add sorting
    const allowedSortFields = ['name', 'email', 'company', 'createdAt', 'lastActivity'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    query += ` ORDER BY ${sortField} ${sortOrder.toUpperCase()}`;

    // Add pagination
    const offset = (page - 1) * limit;
    query += ' LIMIT ? OFFSET ?';
    params.push(limit, offset);

    // Get clients
    const clients = await db.all(query, params);

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM clients WHERE 1=1';
    const countParams: any[] = [];
    
    if (search) {
      countQuery += ' AND (name LIKE ? OR email LIKE ? OR company LIKE ?)';
      const searchTerm = `%${search}%`;
      countParams.push(searchTerm, searchTerm, searchTerm);
    }

    const { total } = await db.get(countQuery, countParams);
    const totalPages = Math.ceil(total / limit);

    sendSuccess(res, 'Clients retrieved successfully', clients, 200, {
      page,
      limit,
      total,
      totalPages
    });
  } catch (error) {
    console.error('Get clients error:', error);
    sendError(res, 'Internal server error', 500);
  }
};

export const getClient = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const db = getDatabase();

    const client = await db.get('SELECT * FROM clients WHERE id = ?', [id]);

    if (!client) {
      sendError(res, 'Client not found', 404);
      return;
    }

    // If user is a client, only allow access to their own data
    if (req.user?.role === 'client' && client.userId !== req.user.id) {
      sendError(res, 'Access denied', 403);
      return;
    }

    sendSuccess(res, 'Client retrieved successfully', client);
  } catch (error) {
    console.error('Get client error:', error);
    sendError(res, 'Internal server error', 500);
  }
};

export const createClient = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { name, email, phone, company, address } = req.body;
    const db = getDatabase();

    // Check if client with email already exists
    const existingClient = await db.get('SELECT id FROM clients WHERE email = ?', [email]);
    if (existingClient) {
      sendError(res, 'Client with this email already exists', 409);
      return;
    }

    const clientId = uuidv4();
    await db.run(
      `INSERT INTO clients (id, userId, name, email, phone, company, address, status, totalInvoices, totalPaid, totalPending)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [clientId, '', name, email, phone, company, address, 'active', 0, 0, 0]
    );

    const newClient = await db.get('SELECT * FROM clients WHERE id = ?', [clientId]);

    sendSuccess(res, 'Client created successfully', newClient, 201);
  } catch (error) {
    console.error('Create client error:', error);
    sendError(res, 'Internal server error', 500);
  }
};

export const updateClient = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, email, phone, company, address, status } = req.body;
    const db = getDatabase();

    // Check if client exists
    const existingClient = await db.get('SELECT * FROM clients WHERE id = ?', [id]);
    if (!existingClient) {
      sendError(res, 'Client not found', 404);
      return;
    }

    // If user is a client, only allow access to their own data
    if (req.user?.role === 'client' && existingClient.userId !== req.user.id) {
      sendError(res, 'Access denied', 403);
      return;
    }

    // Check if email is already taken by another client
    if (email !== existingClient.email) {
      const emailExists = await db.get('SELECT id FROM clients WHERE email = ? AND id != ?', [email, id]);
      if (emailExists) {
        sendError(res, 'Email already taken by another client', 409);
        return;
      }
    }

    await db.run(
      `UPDATE clients SET name = ?, email = ?, phone = ?, company = ?, address = ?, status = ?, updatedAt = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [name, email, phone, company, address, status || existingClient.status, id]
    );

    const updatedClient = await db.get('SELECT * FROM clients WHERE id = ?', [id]);

    sendSuccess(res, 'Client updated successfully', updatedClient);
  } catch (error) {
    console.error('Update client error:', error);
    sendError(res, 'Internal server error', 500);
  }
};

export const deleteClient = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const db = getDatabase();

    // Check if client exists
    const existingClient = await db.get('SELECT * FROM clients WHERE id = ?', [id]);
    if (!existingClient) {
      sendError(res, 'Client not found', 404);
      return;
    }

    // Check if client has associated invoices
    const hasInvoices = await db.get('SELECT COUNT(*) as count FROM invoices WHERE clientId = ?', [id]);
    if (hasInvoices.count > 0) {
      sendError(res, 'Cannot delete client with existing invoices', 400);
      return;
    }

    await db.run('DELETE FROM clients WHERE id = ?', [id]);

    sendSuccess(res, 'Client deleted successfully');
  } catch (error) {
    console.error('Delete client error:', error);
    sendError(res, 'Internal server error', 500);
  }
};

export const getClientStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const db = getDatabase();

    const stats = await db.get(`
      SELECT 
        COUNT(*) as totalClients,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as activeClients,
        COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactiveClients,
        SUM(totalPaid) as totalRevenue,
        AVG(totalPaid) as averageRevenue
      FROM clients
    `);

    sendSuccess(res, 'Client statistics retrieved successfully', stats);
  } catch (error) {
    console.error('Get client stats error:', error);
    sendError(res, 'Internal server error', 500);
  }
};