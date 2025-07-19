import { body, query, param, ValidationChain } from 'express-validator';

// Auth validation
export const validateLogin: ValidationChain[] = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

export const validateRegister: ValidationChain[] = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('company')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Company name must not exceed 100 characters'),
  body('phone')
    .optional()
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number')
];

// Client validation
export const validateClient: ValidationChain[] = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('phone')
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number'),
  body('company')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Company name must be between 2 and 100 characters'),
  body('address')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Address must be between 5 and 200 characters')
];

// Invoice validation
export const validateInvoice: ValidationChain[] = [
  body('clientId')
    .isUUID()
    .withMessage('Please provide a valid client ID'),
  body('date')
    .isISO8601()
    .withMessage('Please provide a valid date'),
  body('dueDate')
    .isISO8601()
    .withMessage('Please provide a valid due date')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.date)) {
        throw new Error('Due date must be after invoice date');
      }
      return true;
    }),
  body('items')
    .isArray({ min: 1 })
    .withMessage('Invoice must have at least one item'),
  body('items.*.description')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Item description is required and must not exceed 200 characters'),
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Item quantity must be a positive integer'),
  body('items.*.unitPrice')
    .isFloat({ min: 0 })
    .withMessage('Item unit price must be a positive number'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes must not exceed 500 characters')
];

// Quote validation
export const validateQuote: ValidationChain[] = [
  body('clientId')
    .isUUID()
    .withMessage('Please provide a valid client ID'),
  body('date')
    .isISO8601()
    .withMessage('Please provide a valid date'),
  body('validUntil')
    .isISO8601()
    .withMessage('Please provide a valid expiration date')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.date)) {
        throw new Error('Expiration date must be after quote date');
      }
      return true;
    }),
  body('items')
    .isArray({ min: 1 })
    .withMessage('Quote must have at least one item'),
  body('items.*.description')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Item description is required and must not exceed 200 characters'),
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Item quantity must be a positive integer'),
  body('items.*.unitPrice')
    .isFloat({ min: 0 })
    .withMessage('Item unit price must be a positive number')
];

// Payment validation
export const validatePayment: ValidationChain[] = [
  body('invoiceId')
    .isUUID()
    .withMessage('Please provide a valid invoice ID'),
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Payment amount must be greater than 0'),
  body('date')
    .isISO8601()
    .withMessage('Please provide a valid payment date'),
  body('method')
    .isIn(['bank_transfer', 'check', 'cash', 'card'])
    .withMessage('Please provide a valid payment method'),
  body('reference')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Reference must not exceed 100 characters')
];

// Message validation
export const validateMessage: ValidationChain[] = [
  body('receiverId')
    .isUUID()
    .withMessage('Please provide a valid receiver ID'),
  body('content')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message content is required and must not exceed 1000 characters'),
  body('type')
    .optional()
    .isIn(['text', 'file'])
    .withMessage('Message type must be either text or file')
];

// Appointment validation
export const validateAppointment: ValidationChain[] = [
  body('title')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Title must be between 2 and 100 characters'),
  body('date')
    .isISO8601()
    .withMessage('Please provide a valid date'),
  body('time')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Please provide a valid time in HH:MM format'),
  body('type')
    .isIn(['presential', 'video', 'phone'])
    .withMessage('Please provide a valid appointment type'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters')
];

// Pagination validation
export const validatePagination: ValidationChain[] = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('sortBy')
    .optional()
    .isAlpha()
    .withMessage('Sort field must contain only letters'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be either asc or desc')
];

// ID validation
export const validateId: ValidationChain[] = [
  param('id')
    .isUUID()
    .withMessage('Please provide a valid ID')
];