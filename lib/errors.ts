export class AppError extends Error {
  constructor(
    message: string,
    public code: string = 'INTERNAL_ERROR',
    public statusCode: number = 500,
    public isOperational: boolean = true,
  ) {
    super(message)
    this.name = 'AppError'
    if (Error.captureStackTrace) Error.captureStackTrace(this, this.constructor)
  }
}

export class NetworkError extends AppError {
  constructor(
    message: string,
    public originalError?: Error,
  ) {
    super(message, 'NETWORK_ERROR', 502)
    this.name = 'NetworkError'
  }
}

export class DatabaseError extends AppError {
  constructor(
    message: string,
    public operation?: string,
  ) {
    super(message, 'DATABASE_ERROR', 500)
    this.name = 'DatabaseError'
  }
}

export class ValidationError extends AppError {
  constructor(
    message: string,
    public field?: string,
  ) {
    super(message, 'VALIDATION_ERROR', 400)
    this.name = 'ValidationError'
  }
}

export class NotFoundError extends AppError {
  constructor(
    resource: string,
    public id?: string,
  ) {
    super(
      `${resource}${id ? ` with ID: ${id}` : ''} not found`,
      'NOT_FOUND',
      404,
    )
    this.name = 'NotFoundError'
  }
}

export class InsufficientStockError extends AppError {
  constructor(
    public productName: string,
    public requested: number,
    public available: number,
  ) {
    super(
      `Insufficient stock for ${productName}. Requested: ${requested}, Available: ${available}`,
      'INSUFFICIENT_STOCK',
      409,
    )
    this.name = 'InsufficientStockError'
  }
}

export function formatError(error: unknown): string {
  if (error instanceof AppError) {
    return error.message
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'An unexpected error occurred'
}

export function getErrorCode(error: unknown): string {
  if (error instanceof AppError) {
    return error.code
  }
  return 'UNKNOWN_ERROR'
}

export function getStatusCode(error: unknown): number {
  if (error instanceof AppError) {
    return error.statusCode
  }
  return 500
}
