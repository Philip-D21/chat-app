import { Request, Response, NextFunction } from 'express';
import AppError from '../utils/appError';

// Handle CastError from MongoDB
const handleCastErrorDB = (err: any): AppError => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 404);
};

// Handle Duplicate Fields Error (E11000)
const handleDuplicateFieldsError = (err: any): AppError => {
  const message = `${Object.keys(err.keyValue)} already exists in the database. Please use another value.`;
  return new AppError(message, 400);
};

// Handle Validation Errors (Mongoose)
const handleValidationError = (err: any): AppError => {
  const errors = Object.values(err.errors).map((val: any) => val.message);
  const message = `Invalid input data: ${errors.join('; ')}`;
  return new AppError(message, 422);
};

// Handle JSON Web Token (JWT) Errors
const handleJsonWebTokenError = (err: any): AppError => {
  const message = `${err.name}: ${err.message}`;
  return new AppError(message, 401);
};

// Handle Expired JWT Error
const handleExpiredJWTError = (err: any): AppError => {
  const message = `${err.message}! Please login again.`;
  return new AppError(message, 401);
};

// Send detailed error response in development environment
const sendErrorDev = (err: AppError, res: Response): void => {
  res.status(err.statusCode || 500).json({
    status: err.status || 'error',
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

// Send concise error response in production environment
const sendErrorProd = (err: AppError, res: Response): void => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.error('ERROR', err);
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong',
    });
  }
};

export default (err: any, req: Request, res: Response, next: NextFunction): void => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;

    if (error.name === 'CastError') {
      error = handleCastErrorDB(error);
    }
    if (error.code === 11000) {
      error = handleDuplicateFieldsError(error);
    }
    if (error.name === 'ValidationError') {
      error = handleValidationError(error);
    }
    if (error.name === 'JsonWebTokenError') {
      error = handleJsonWebTokenError(error);
    }
    if (error.name === 'TokenExpiredError') {
      error = handleExpiredJWTError(error);
    }

    sendErrorProd(error, res);
  }
};
