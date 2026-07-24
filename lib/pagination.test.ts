import {
  ADMIN_PAGE_SIZE,
  SHOP_PAGE_SIZE,
  SEARCH_PAGE_SIZE,
  USER_ORDERS_PAGE_SIZE,
  FAVOURITES_PAGE_SIZE,
  encodeCursor,
  decodeCursor,
} from './pagination'

describe('pagination constants', () => {
  it('should have expected values', () => {
    expect(ADMIN_PAGE_SIZE).toBe(50)
    expect(SHOP_PAGE_SIZE).toBe(24)
    expect(SEARCH_PAGE_SIZE).toBe(20)
    expect(USER_ORDERS_PAGE_SIZE).toBe(20)
    expect(FAVOURITES_PAGE_SIZE).toBe(20)
  })
})

describe('encodeCursor', () => {
  it('should base64 encode { id }', () => {
    const encoded = encodeCursor('abc-123')
    const decoded = Buffer.from(encoded, 'base64').toString('utf-8')
    expect(JSON.parse(decoded)).toEqual({ id: 'abc-123' })
  })

  it('should handle empty string id', () => {
    const encoded = encodeCursor('')
    const decoded = Buffer.from(encoded, 'base64').toString('utf-8')
    expect(JSON.parse(decoded)).toEqual({ id: '' })
  })
})

describe('decodeCursor', () => {
  it('should decode a valid base64 cursor', () => {
    const input = Buffer.from(JSON.stringify({ id: 'abc-123' })).toString(
      'base64',
    )
    expect(decodeCursor(input)).toEqual({ id: 'abc-123' })
  })
})

describe('encodeCursor / decodeCursor round-trip', () => {
  it('should return the original id after encode then decode', () => {
    const ids = ['abc-123', 'xyz-789', '', 'some-long-id-here']
    for (const id of ids) {
      const cursor = encodeCursor(id)
      const result = decodeCursor(cursor)
      expect(result).toEqual({ id })
    }
  })
})
