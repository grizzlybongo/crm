import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Invoice from '../models/Invoice';
import Client from '../models/Client';
import { AppError, sendSuccessResponse } from '../utils/errorHandler';
import { AuthRequest, InvoiceResponse } from '../types';

// Map MongoDB document to frontend Invoice response
const mapInvoiceToResponse = async (invoice: any): Promise<InvoiceResponse> => {
  let clientName = '';
  
  try {
    const client = await Client.findById(invoice.clientId);
    if (client) {
      clientName = client.name;
    }
  } catch (error) {
    // If client not found, continue without the name
  }
  
  return {
    id: invoice._id.toString(),
    number: invoice.number,
    clientId: invoice.clientId.toString(),
    clientName,
    date: invoice.date.toISOString().split('T')[0],
    dueDate: invoice.dueDate.toISOString().split('T')[0],
    status: invoice.status,
    items: invoice.items.map((item: any, index: number) => ({
      id: index.toString(), // Use index as ID
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      total: item.total
    })),
    subtotal: invoice.subtotal,
    tax: invoice.tax,
    total: invoice.total,
    notes: invoice.notes
  };
};

// Get all invoices
export const getAllInvoices = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return next(new AppError('Not authenticated', 401));
    }

    let invoices;
    if (req.user.role === 'admin') {
      // Admins can see all invoices
      invoices = await Invoice.find().sort({ date: -1 });
    } else {
      // Clients can only see their own invoices
      const client = await Client.findOne({ email: req.user.email });
      if (!client) {
        return next(new AppError('Client profile not found', 404));
      }
      
      invoices = await Invoice.find({ clientId: client._id }).sort({ date: -1 });
    }

    const invoiceResponses = await Promise.all(invoices.map(mapInvoiceToResponse));

    sendSuccessResponse(res, invoiceResponses, 'Invoices retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// Get invoice by ID
export const getInvoiceById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return next(new AppError('Not authenticated', 401));
    }

    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new AppError('Invalid invoice ID', 400));
    }

    const invoice = await Invoice.findById(id);
    
    if (!invoice) {
      return next(new AppError('Invoice not found', 404));
    }

    // Check if user has access to this invoice
    if (req.user.role !== 'admin') {
      const client = await Client.findOne({ email: req.user.email });
      if (!client || !invoice.clientId.equals(client._id)) {
        return next(new AppError('Not authorized to access this invoice', 403));
      }
    }

    const invoiceResponse = await mapInvoiceToResponse(invoice);
    sendSuccessResponse(res, invoiceResponse, 'Invoice retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// Create a new invoice
export const createInvoice = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return next(new AppError('Not authorized to create invoices', 403));
    }

    const { number, clientId, date, dueDate, items, notes, status } = req.body;

    // Validate client ID
    if (!mongoose.Types.ObjectId.isValid(clientId)) {
      return next(new AppError('Invalid client ID', 400));
    }

    // Check if client exists
    const client = await Client.findById(clientId);
    if (!client) {
      return next(new AppError('Client not found', 404));
    }

    // Check if invoice number already exists
    const existingInvoice = await Invoice.findOne({ number });
    if (existingInvoice) {
      return next(new AppError('Invoice number already exists', 400));
    }

    // Calculate totals for each item
    const processedItems = items.map((item: any) => ({
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      total: item.quantity * item.unitPrice
    }));

    // Calculate subtotal
    const subtotal = processedItems.reduce((sum: number, item: any) => sum + item.total, 0);
    
    // Calculate tax (assuming 20% VAT)
    const tax = subtotal * 0.2;
    
    // Calculate total
    const total = subtotal + tax;

    // Create invoice
    const invoice = await Invoice.create({
      number,
      clientId,
      date: new Date(date),
      dueDate: new Date(dueDate),
      status: status || 'draft',
      items: processedItems,
      subtotal,
      tax,
      total,
      notes
    });

    // Update client's invoice statistics
    await Client.findByIdAndUpdate(
      clientId,
      {
        $inc: { 
          totalInvoices: 1,
          totalPending: status !== 'paid' ? total : 0
        },
        lastActivity: new Date()
      }
    );

    const invoiceResponse = await mapInvoiceToResponse(invoice);
    sendSuccessResponse(res, invoiceResponse, 'Invoice created successfully', 201);
  } catch (error) {
    next(error);
  }
};

// Update invoice
export const updateInvoice = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return next(new AppError('Not authorized to update invoices', 403));
    }

    const { id } = req.params;
    const { number, clientId, date, dueDate, items, notes, status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new AppError('Invalid invoice ID', 400));
    }

    // Get existing invoice
    const existingInvoice = await Invoice.findById(id);
    if (!existingInvoice) {
      return next(new AppError('Invoice not found', 404));
    }

    // If changing the invoice number, check if new number is already taken
    if (number && number !== existingInvoice.number) {
      const duplicateInvoice = await Invoice.findOne({ number, _id: { $ne: id } });
      if (duplicateInvoice) {
        return next(new AppError('Invoice number already exists', 400));
      }
    }

    // If changing client, validate client ID and check if client exists
    if (clientId && clientId !== existingInvoice.clientId.toString()) {
      if (!mongoose.Types.ObjectId.isValid(clientId)) {
        return next(new AppError('Invalid client ID', 400));
      }

      const client = await Client.findById(clientId);
      if (!client) {
        return next(new AppError('Client not found', 404));
      }
    }

    // Calculate totals for each item if provided
    let processedItems = existingInvoice.items;
    let subtotal = existingInvoice.subtotal;
    let tax = existingInvoice.tax;
    let total = existingInvoice.total;

    if (items) {
      processedItems = items.map((item: any) => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.quantity * item.unitPrice
      }));

      // Calculate subtotal
      subtotal = processedItems.reduce((sum: number, item: any) => sum + item.total, 0);
      
      // Calculate tax (assuming 20% VAT)
      tax = subtotal * 0.2;
      
      // Calculate total
      total = subtotal + tax;
    }

    // Update invoice
    const updatedInvoice = await Invoice.findByIdAndUpdate(
      id,
      {
        number: number || existingInvoice.number,
        clientId: clientId || existingInvoice.clientId,
        date: date ? new Date(date) : existingInvoice.date,
        dueDate: dueDate ? new Date(dueDate) : existingInvoice.dueDate,
        status: status || existingInvoice.status,
        items: processedItems,
        subtotal,
        tax,
        total,
        notes: notes !== undefined ? notes : existingInvoice.notes
      },
      { new: true, runValidators: true }
    );

    // Update client statistics when status changes
    if (
      status &&
      status !== existingInvoice.status &&
      updatedInvoice !== null &&
      updatedInvoice !== undefined
    ) {
      const clientId = updatedInvoice.clientId;
      
      // If invoice was previously not paid and now it's paid
      if (existingInvoice.status !== 'paid' && status === 'paid') {
        await Client.findByIdAndUpdate(
          clientId,
          {
            $inc: { 
              totalPaid: total,
              totalPending: -total
            },
            lastActivity: new Date()
          }
        );
      }
      // If invoice was previously paid and now it's not paid
      else if (existingInvoice.status === 'paid' && status !== 'paid') {
        await Client.findByIdAndUpdate(
          clientId,
          {
            $inc: { 
              totalPaid: -total,
              totalPending: total
            },
            lastActivity: new Date()
          }
        );
      }
    }

    const invoiceResponse = await mapInvoiceToResponse(updatedInvoice);
    sendSuccessResponse(res, invoiceResponse, 'Invoice updated successfully');
  } catch (error) {
    next(error);
  }
};

// Delete invoice
export const deleteInvoice = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return next(new AppError('Not authorized to delete invoices', 403));
    }

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new AppError('Invalid invoice ID', 400));
    }

    const invoice = await Invoice.findById(id);
    if (!invoice) {
      return next(new AppError('Invoice not found', 404));
    }

    // Update client statistics before deleting invoice
    if (invoice.status === 'paid') {
      await Client.findByIdAndUpdate(
        invoice.clientId,
        {
          $inc: { 
            totalInvoices: -1,
            totalPaid: -invoice.total
          }
        }
      );
    } else {
      await Client.findByIdAndUpdate(
        invoice.clientId,
        {
          $inc: { 
            totalInvoices: -1,
            totalPending: -invoice.total
          }
        }
      );
    }

    await Invoice.findByIdAndDelete(id);

    sendSuccessResponse(res, null, 'Invoice deleted successfully');
  } catch (error) {
    next(error);
  }
}; 