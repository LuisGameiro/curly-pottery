import {
  AppError,
  NetworkError,
  DatabaseError,
  ValidationError,
  NotFoundError,
  InsufficientStockError,
  formatError,
  getErrorCode,
  getStatusCode,
} from './errors'

describe('AppError', () => {
  it('should set correct name and defaults', () => {
    const error = new AppError('Something went wrong')
    expect(error.name).toBe('AppError')
    expect(error.message).toBe('Something went wrong')
    expect(error.code).toBe('INTERNAL_ERROR')
    expect(error.statusCode).toBe(500)
    expect(error.isOperational).toBe(true)
    expect(error).toBeInstanceOf(Error)
    expect(error).toBeInstanceOf(AppError)
  })

  it('should accept custom code, statusCode, and isOperational', () => {
    const error = new AppError('Custom error', 'CUSTOM_CODE', 400, false)
    expect(error.code).toBe('CUSTOM_CODE')
    expect(error.statusCode).toBe(400)
    expect(error.isOperational).toBe(false)
  })
})

describe('NetworkError', () => {
  it('should extend AppError with correct defaults', () => {
    const error = new NetworkError('Network failure')
    expect(error.name).toBe('NetworkError')
    expect(error.message).toBe('Network failure')
    expect(error.code).toBe('NETWORK_ERROR')
    expect(error.statusCode).toBe(502)
    expect(error.isOperational).toBe(true)
    expect(error).toBeInstanceOf(Error)
    expect(error).toBeInstanceOf(AppError)
    expect(error).toBeInstanceOf(NetworkError)
  })

  it('should accept an original error', () => {
    const cause = new Error('ECONNREFUSED')
    const error = new NetworkError('Network failure', cause)
    expect(error.originalError).toBe(cause)
  })
})

describe('DatabaseError', () => {
  it('should extend AppError with correct defaults', () => {
    const error = new DatabaseError('Query failed')
    expect(error.name).toBe('DatabaseError')
    expect(error.message).toBe('Query failed')
    expect(error.code).toBe('DATABASE_ERROR')
    expect(error.statusCode).toBe(500)
    expect(error).toBeInstanceOf(Error)
    expect(error).toBeInstanceOf(AppError)
    expect(error).toBeInstanceOf(DatabaseError)
  })

  it('should accept an operation name', () => {
    const error = new DatabaseError('Query failed', 'findUser')
    expect(error.operation).toBe('findUser')
  })
})

describe('ValidationError', () => {
  it('should extend AppError with correct defaults', () => {
    const error = new ValidationError('Invalid input')
    expect(error.name).toBe('ValidationError')
    expect(error.message).toBe('Invalid input')
    expect(error.code).toBe('VALIDATION_ERROR')
    expect(error.statusCode).toBe(400)
    expect(error).toBeInstanceOf(Error)
    expect(error).toBeInstanceOf(AppError)
    expect(error).toBeInstanceOf(ValidationError)
  })

  it('should accept a field name', () => {
    const error = new ValidationError('Field is required', 'email')
    expect(error.field).toBe('email')
  })
})

describe('NotFoundError', () => {
  it('should extend AppError with correct defaults', () => {
    const error = new NotFoundError('Product')
    expect(error.name).toBe('NotFoundError')
    expect(error.message).toBe('Product not found')
    expect(error.code).toBe('NOT_FOUND')
    expect(error.statusCode).toBe(404)
    expect(error).toBeInstanceOf(Error)
    expect(error).toBeInstanceOf(AppError)
    expect(error).toBeInstanceOf(NotFoundError)
  })

  it('should include id in message when provided', () => {
    const error = new NotFoundError('Product', 'abc-123')
    expect(error.message).toBe('Product with ID: abc-123 not found')
    expect(error.id).toBe('abc-123')
  })
})

describe('InsufficientStockError', () => {
  it('should extend AppError with correct defaults', () => {
    const error = new InsufficientStockError('Vase', 10, 3)
    expect(error.name).toBe('InsufficientStockError')
    expect(error.message).toBe(
      'Insufficient stock for Vase. Requested: 10, Available: 3',
    )
    expect(error.code).toBe('INSUFFICIENT_STOCK')
    expect(error.statusCode).toBe(409)
    expect(error.productName).toBe('Vase')
    expect(error.requested).toBe(10)
    expect(error.available).toBe(3)
    expect(error).toBeInstanceOf(Error)
    expect(error).toBeInstanceOf(AppError)
    expect(error).toBeInstanceOf(InsufficientStockError)
  })
})

describe('formatError', () => {
  it('should return message for AppError', () => {
    const error = new AppError('App-level error')
    expect(formatError(error)).toBe('App-level error')
  })

  it('should return message for regular Error', () => {
    const error = new Error('Regular error')
    expect(formatError(error)).toBe('Regular error')
  })

  it('should return fallback for non-Error input', () => {
    expect(formatError(null)).toBe('An unexpected error occurred')
    expect(formatError(undefined)).toBe('An unexpected error occurred')
    expect(formatError('string')).toBe('An unexpected error occurred')
    expect(formatError(42)).toBe('An unexpected error occurred')
  })
})

describe('getErrorCode', () => {
  it('should return code for AppError', () => {
    const error = new ValidationError('Bad input')
    expect(getErrorCode(error)).toBe('VALIDATION_ERROR')
  })

  it('should return UNKNOWN_ERROR for regular Error', () => {
    const error = new Error('Something broke')
    expect(getErrorCode(error)).toBe('UNKNOWN_ERROR')
  })

  it('should return UNKNOWN_ERROR for non-Error input', () => {
    expect(getErrorCode(null)).toBe('UNKNOWN_ERROR')
  })
})

describe('getStatusCode', () => {
  it('should return statusCode for AppError', () => {
    const error = new NotFoundError('Product')
    expect(getStatusCode(error)).toBe(404)
  })

  it('should return 500 for regular Error', () => {
    const error = new Error('Something broke')
    expect(getStatusCode(error)).toBe(500)
  })

  it('should return 500 for non-Error input', () => {
    expect(getStatusCode(null)).toBe(500)
  })
})
