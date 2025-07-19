import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';
import { User, Client, Invoice, InvoiceItem, Quote, QuoteItem, Payment, Message, Notification, Document, Appointment } from '../types';

let db: Database<sqlite3.Database, sqlite3.Statement>;

export const initializeDatabase = async (): Promise<void> => {
  try {
    // Open SQLite database
    db = await open({
      filename: process.env.DB_PATH || './database.sqlite',
      driver: sqlite3.Database
    });

    // Enable foreign keys
    await db.exec('PRAGMA foreign_keys = ON');

    // Create tables
    await createTables();
    
    // Insert sample data
    await insertSampleData();

    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
};

const createTables = async (): Promise<void> => {
  // Users table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT CHECK(role IN ('admin', 'client')) NOT NULL,
      company TEXT,
      avatar TEXT,
      phone TEXT,
      address TEXT,
      isActive BOOLEAN DEFAULT 1,
      emailVerified BOOLEAN DEFAULT 0,
      lastLogin DATETIME,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Clients table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS clients (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      company TEXT NOT NULL,
      address TEXT NOT NULL,
      status TEXT CHECK(status IN ('active', 'inactive')) DEFAULT 'active',
      totalInvoices INTEGER DEFAULT 0,
      totalPaid REAL DEFAULT 0,
      totalPending REAL DEFAULT 0,
      lastActivity DATETIME DEFAULT CURRENT_TIMESTAMP,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Invoices table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS invoices (
      id TEXT PRIMARY KEY,
      number TEXT UNIQUE NOT NULL,
      clientId TEXT NOT NULL,
      date DATETIME NOT NULL,
      dueDate DATETIME NOT NULL,
      status TEXT CHECK(status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')) DEFAULT 'draft',
      subtotal REAL NOT NULL,
      tax REAL NOT NULL,
      total REAL NOT NULL,
      notes TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (clientId) REFERENCES clients(id) ON DELETE CASCADE
    )
  `);

  // Invoice items table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS invoice_items (
      id TEXT PRIMARY KEY,
      invoiceId TEXT NOT NULL,
      description TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      unitPrice REAL NOT NULL,
      total REAL NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (invoiceId) REFERENCES invoices(id) ON DELETE CASCADE
    )
  `);

  // Quotes table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS quotes (
      id TEXT PRIMARY KEY,
      number TEXT UNIQUE NOT NULL,
      clientId TEXT NOT NULL,
      date DATETIME NOT NULL,
      validUntil DATETIME NOT NULL,
      status TEXT CHECK(status IN ('draft', 'sent', 'accepted', 'rejected', 'expired')) DEFAULT 'draft',
      subtotal REAL NOT NULL,
      tax REAL NOT NULL,
      total REAL NOT NULL,
      notes TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (clientId) REFERENCES clients(id) ON DELETE CASCADE
    )
  `);

  // Quote items table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS quote_items (
      id TEXT PRIMARY KEY,
      quoteId TEXT NOT NULL,
      description TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      unitPrice REAL NOT NULL,
      total REAL NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (quoteId) REFERENCES quotes(id) ON DELETE CASCADE
    )
  `);

  // Payments table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      invoiceId TEXT NOT NULL,
      clientId TEXT NOT NULL,
      amount REAL NOT NULL,
      date DATETIME NOT NULL,
      method TEXT CHECK(method IN ('bank_transfer', 'check', 'cash', 'card')) NOT NULL,
      status TEXT CHECK(status IN ('pending', 'completed', 'failed')) DEFAULT 'pending',
      reference TEXT,
      notes TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (invoiceId) REFERENCES invoices(id) ON DELETE CASCADE,
      FOREIGN KEY (clientId) REFERENCES clients(id) ON DELETE CASCADE
    )
  `);

  // Messages table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      senderId TEXT NOT NULL,
      receiverId TEXT NOT NULL,
      content TEXT NOT NULL,
      type TEXT CHECK(type IN ('text', 'file')) DEFAULT 'text',
      fileName TEXT,
      filePath TEXT,
      read BOOLEAN DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (senderId) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (receiverId) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Notifications table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT CHECK(type IN ('info', 'success', 'warning', 'error')) DEFAULT 'info',
      read BOOLEAN DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Documents table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      name TEXT NOT NULL,
      originalName TEXT NOT NULL,
      mimeType TEXT NOT NULL,
      size INTEGER NOT NULL,
      path TEXT NOT NULL,
      category TEXT CHECK(category IN ('contract', 'invoice', 'report', 'other')) DEFAULT 'other',
      status TEXT CHECK(status IN ('active', 'archived')) DEFAULT 'active',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Appointments table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS appointments (
      id TEXT PRIMARY KEY,
      clientId TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      date DATETIME NOT NULL,
      time TEXT NOT NULL,
      type TEXT CHECK(type IN ('presential', 'video', 'phone')) NOT NULL,
      status TEXT CHECK(status IN ('scheduled', 'completed', 'cancelled')) DEFAULT 'scheduled',
      location TEXT,
      meetingUrl TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (clientId) REFERENCES clients(id) ON DELETE CASCADE
    )
  `);

  // Create indexes for better performance
  await db.exec(`
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_clients_userId ON clients(userId);
    CREATE INDEX IF NOT EXISTS idx_invoices_clientId ON invoices(clientId);
    CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
    CREATE INDEX IF NOT EXISTS idx_payments_invoiceId ON payments(invoiceId);
    CREATE INDEX IF NOT EXISTS idx_messages_senderId ON messages(senderId);
    CREATE INDEX IF NOT EXISTS idx_messages_receiverId ON messages(receiverId);
    CREATE INDEX IF NOT EXISTS idx_notifications_userId ON notifications(userId);
    CREATE INDEX IF NOT EXISTS idx_documents_userId ON documents(userId);
    CREATE INDEX IF NOT EXISTS idx_appointments_clientId ON appointments(clientId);
  `);
};

const insertSampleData = async (): Promise<void> => {
  // Check if data already exists
  const userCount = await db.get('SELECT COUNT(*) as count FROM users');
  if (userCount.count > 0) {
    return; // Data already exists
  }

  // Insert admin user
  await db.run(`
    INSERT INTO users (id, email, password, name, role, company, isActive, emailVerified)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    'admin',
    'admin@erp.com',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/hL8.WuFyG', // admin123
    'Administrateur',
    'admin',
    'ERP Solutions',
    1,
    1
  ]);

  // Insert client user
  await db.run(`
    INSERT INTO users (id, email, password, name, role, company, phone, isActive, emailVerified)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    '1',
    'jean.dupont@email.com',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/hL8.WuFyG', // client123
    'Jean Dupont',
    'client',
    'Tech Solutions SAS',
    '01 23 45 67 89',
    1,
    1
  ]);

  // Insert client record
  await db.run(`
    INSERT INTO clients (id, userId, name, email, phone, company, address, status, totalInvoices, totalPaid, totalPending)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    '1',
    '1',
    'Jean Dupont',
    'jean.dupont@email.com',
    '01 23 45 67 89',
    'Tech Solutions SAS',
    '123 Rue de la République, 75001 Paris',
    'active',
    2,
    38400,
    14400
  ]);

  // Insert sample invoices
  await db.run(`
    INSERT INTO invoices (id, number, clientId, date, dueDate, status, subtotal, tax, total, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    '1',
    'FAC-2024-001',
    '1',
    '2024-01-15',
    '2024-02-15',
    'paid',
    32000,
    6400,
    38400,
    'Merci pour votre confiance'
  ]);

  await db.run(`
    INSERT INTO invoices (id, number, clientId, date, dueDate, status, subtotal, tax, total)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    '2',
    'FAC-2024-002',
    '1',
    '2024-01-18',
    '2024-02-18',
    'sent',
    12000,
    2400,
    14400
  ]);

  // Insert invoice items
  await db.run(`
    INSERT INTO invoice_items (id, invoiceId, description, quantity, unitPrice, total)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [
    '1',
    '1',
    'Développement application web',
    40,
    800,
    32000
  ]);

  await db.run(`
    INSERT INTO invoice_items (id, invoiceId, description, quantity, unitPrice, total)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [
    '2',
    '2',
    'Design UI/UX',
    20,
    600,
    12000
  ]);

  // Insert sample payment
  await db.run(`
    INSERT INTO payments (id, invoiceId, clientId, amount, date, method, status, reference)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    '1',
    '1',
    '1',
    38400,
    '2024-01-20',
    'bank_transfer',
    'completed',
    'VIR-20240120-001'
  ]);

  // Insert sample messages
  await db.run(`
    INSERT INTO messages (id, senderId, receiverId, content, type, read)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [
    '1',
    '1',
    'admin',
    'Bonjour, j\'ai une question concernant ma facture.',
    'text',
    1
  ]);

  await db.run(`
    INSERT INTO messages (id, senderId, receiverId, content, type, read)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [
    '2',
    'admin',
    '1',
    'Bonjour Jean, je suis là pour vous aider. Quelle est votre question ?',
    'text',
    1
  ]);

  // Insert sample notifications
  await db.run(`
    INSERT INTO notifications (id, userId, title, message, type, read)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [
    '1',
    'admin',
    'Nouvelle facture',
    'Une nouvelle facture a été créée pour Jean Dupont',
    'info',
    0
  ]);

  await db.run(`
    INSERT INTO notifications (id, userId, title, message, type, read)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [
    '2',
    'admin',
    'Paiement reçu',
    'Paiement de 38 400 € reçu de Jean Dupont',
    'success',
    0
  ]);

  console.log('✅ Sample data inserted successfully');
};

export const getDatabase = (): Database<sqlite3.Database, sqlite3.Statement> => {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return db;
};

export const closeDatabase = async (): Promise<void> => {
  if (db) {
    await db.close();
    console.log('✅ Database connection closed');
  }
};