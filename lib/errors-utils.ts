import { prisma } from 'prisma/prisma'
import {
  AppError,
  DatabaseError,
  NetworkError,
  formatError,
  InsufficientStockError,
} from './errors'
import type { ActionResponse } from './types/types'

export async function withDatabase<T>(
  operation: string,
  fn: (tx: typeof prisma) => Promise<T>,
): Promise<ActionResponse<T>> {
  try {
    const result = await prisma.$transaction(async (tx) => {
      return fn(tx as typeof prisma)
    })
    return { success: true, message: 'Operation successful', data: result }
  } catch (error) {
    console.error(`Database operation "${operation}" failed:`, error)
    if (error instanceof AppError) {
      return { success: false, message: error.message, errors: error }
    }
    return {
      success: false,
      message: formatError(error),
      errors: new DatabaseError(`Failed to ${operation}`, operation),
    }
  }
}

interface FetchOptions extends RequestInit {
  timeout?: number
}

export async function withFetch<T>(
  url: string,
  options: FetchOptions = {},
): Promise<ActionResponse<T>> {
  const { timeout = 10000, ...fetchOptions } = options
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    const data = await response.json().catch(() => null)

    if (!response.ok) {
      const message = data?.message || `HTTP error ${response.status}`
      throw new NetworkError(message)
    }

    return { success: true, message: 'Fetch successful', data: data as T }
  } catch (error) {
    clearTimeout(timeoutId)
    console.error(`Fetch to "${url}" failed:`, error)

    if (error instanceof NetworkError) {
      return { success: false, message: error.message, errors: error }
    }

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return {
          success: false,
          message: 'Request timed out',
          errors: new NetworkError('Request timed out', error),
        }
      }
      return {
        success: false,
        message: formatError(error),
        errors: new NetworkError(error.message, error),
      }
    }

    return {
      success: false,
      message: 'Network request failed',
      errors: new NetworkError('Unknown network error'),
    }
  }
}

export function handleStockError(
  productName: string,
  requested: number,
  available: number,
): { success: false; message: string; errors: InsufficientStockError } {
  const error = new InsufficientStockError(productName, requested, available)
  return { success: false, message: error.message, errors: error }
}

export function handleNotFound(
  resource: string,
  id?: string,
): { success: false; message: string; errors: AppError } {
  const error = new AppError(
    `${resource}${id ? ` with ID: ${id}` : ''} not found`,
    'NOT_FOUND',
    404,
  )
  return { success: false, message: error.message, errors: error }
}
