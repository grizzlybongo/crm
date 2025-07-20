# CRM/ERP System

A comprehensive CRM/ERP system with client management, invoicing, messaging, document management, and payment tracking.

## Features

- **Authentication**: Secure user authentication with MongoDB and JWT
- **Client Management**: Track clients, contact information, and activity
- **Invoicing**: Create, manage, and track invoices and payments
- **Messaging**: In-app messaging system between administrators and clients
- **Document Management**: Cloud-based document storage and management
- **Payment Tracking**: Track client payments and outstanding balances

## Tech Stack

- **Frontend**: React with TypeScript, Ant Design, and TailwindCSS
- **Backend**: Express.js with TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT-based authentication with bcrypt password hashing

## Getting Started

### Prerequisites

- Node.js (v14+)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/crm-system.git
cd crm-system
```

2. **Install dependencies**

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
```

3. **Set up environment variables**

Run the script to generate a secure .env file for the backend:

```bash
cd backend
node create-env.js
```

This will create a `.env` file with a secure JWT secret. You should update the MongoDB URI to point to your MongoDB instance.

4. **Run the application**

```bash
# Start the frontend and backend concurrently
npm run dev

# Or start them separately
# Frontend
npm run dev

# Backend (in a separate terminal)
npm run backend
```

## Authentication System

The application uses a MongoDB-based authentication system with the following features:

- **Secure Password Storage**: Passwords are hashed using bcrypt before storage
- **JWT-based Authentication**: JSON Web Tokens for secure, stateless authentication
- **Role-based Access Control**: Different permissions for admin and client users
- **API Rate Limiting**: Protection against brute-force attacks
- **Secure HTTP Headers**: Using helmet for additional security

### Authentication Flow

1. **Registration**: Users can register with email, password, name, and optional company details
2. **Login**: Users can login with email and password to receive a JWT token
3. **Session Management**: Frontend stores the token in localStorage for persistence
4. **API Authentication**: All protected API routes verify the JWT token
5. **Role Authorization**: Certain routes are restricted based on user roles

### User Schema in MongoDB

The User model includes:

- **email**: User's email address (unique)
- **password**: Hashed password (never returned in queries)
- **name**: User's full name
- **role**: Either 'admin' or 'client'
- **company**: Optional company name
- **avatar**: Optional URL to user's avatar
- **timestamps**: createdAt and updatedAt fields for tracking

## API Documentation

### Authentication Endpoints

- **POST** `/api/auth/register`: Register a new user
- **POST** `/api/auth/login`: Login and get JWT token
- **GET** `/api/auth/me`: Get current user details (requires authentication)

## MongoDB Schema

The application uses MongoDB with Mongoose ODM for data storage. Here's an overview of the main data models:

### User

- **_id**: MongoDB ObjectId (unique identifier)
- **email**: User email (unique)
- **password**: Hashed password (bcrypt)
- **name**: User's full name
- **role**: 'admin' or 'client'
- **company**: Company name (optional)
- **avatar**: User avatar URL (optional)
- **createdAt**: Creation timestamp (automatic)
- **updatedAt**: Last update timestamp (automatic)

### Client

- **_id**: MongoDB ObjectId (unique identifier)
- **name**: Client's full name
- **email**: Client's email
- **phone**: Client's phone number
- **company**: Client's company name
- **address**: Client's address
- **status**: 'active' or 'inactive'
- **createdBy**: User ID who created the client
- **createdAt**: Creation timestamp
- **updatedAt**: Last update timestamp

### Invoice

- **_id**: MongoDB ObjectId (unique identifier)
- **number**: Invoice number (unique)
- **client**: Reference to Client model
- **date**: Invoice date
- **dueDate**: Invoice due date
- **status**: 'draft', 'sent', 'paid', 'partial', 'overdue', or 'cancelled'
- **items**: Array of line items
- **subtotal**: Invoice subtotal
- **tax**: Tax amount
- **total**: Total amount
- **notes**: Additional notes (optional)
- **createdBy**: User ID who created the invoice
- **createdAt**: Creation timestamp
- **updatedAt**: Last update timestamp

## License

This project is licensed under the MIT License - see the LICENSE file for details.