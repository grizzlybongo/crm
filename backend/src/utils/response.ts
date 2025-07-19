import { Response } from 'express';
import { ApiResponse } from '../types';

export const sendSuccess = <T>(
  res: Response,
  message: string,
  data?: T,
  statusCode: number = 200,
  pagination?: any
): Response => {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
    pagination
  };
  return res.status(statusCode).json(response);
};

export const sendError = (
  res: Response,
  message: string,
  statusCode: number = 400,
  error?: string
): Response => {
  const response: ApiResponse = {
    success: false,
    message,
    error
  };
  return res.status(statusCode).json(response);
};

export const sendValidationError = (
  res: Response,
  errors: any[]
): Response => {
  return sendError(
    res,
    'Validation failed',
    422,
    errors.map(err => err.msg).join(', ')
  );
};