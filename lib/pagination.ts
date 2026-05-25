export interface PaginationInput {
  cursor?: string | null
  take?: number
  search?: string
}

export interface PaginatedResult<T> {
  items: T[]
  nextCursor: string | null
  hasMore: boolean
  total: number
}

export const ADMIN_PAGE_SIZE = 50
export const SHOP_PAGE_SIZE = 24
export const SEARCH_PAGE_SIZE = 20
export const USER_ORDERS_PAGE_SIZE = 20
export const FAVOURITES_PAGE_SIZE = 20

export function encodeCursor(id: string): string {
  return Buffer.from(JSON.stringify({ id })).toString('base64')
}

export function decodeCursor(cursor: string): { id: string } {
  return JSON.parse(Buffer.from(cursor, 'base64').toString('utf-8'))
}
