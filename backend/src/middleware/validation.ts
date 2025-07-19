import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { sendValidationError } from '../utils/response';

export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    sendValidationError(res, errors.array());
    return;
  }
  
  next();
};