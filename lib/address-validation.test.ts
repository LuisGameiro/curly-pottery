import { validateUKPostcode } from './address-validation'

beforeEach(() => {
  jest.clearAllMocks()
})

describe('validateUKPostcode', () => {
  it('should return false for empty postcode', async () => {
    const result = await validateUKPostcode('')
    expect(result).toBe(false)
  })

  it('should return true when API returns result: true', async () => {
    const mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({ result: true }),
    }
    global.fetch = jest.fn().mockResolvedValue(mockResponse)

    const result = await validateUKPostcode('SW1A 1AA')
    expect(result).toBe(true)
  })

  it('should return false when API returns result: false', async () => {
    const mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({ result: false }),
    }
    global.fetch = jest.fn().mockResolvedValue(mockResponse)

    const result = await validateUKPostcode('INVALID')
    expect(result).toBe(false)
  })

  it('should fall back to regex when fetch throws', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network failure'))

    const result = await validateUKPostcode('SW1A 1AA')
    expect(result).toBe(true)
  })

  it('should fall back to regex and reject invalid postcodes on API failure', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network failure'))

    const result = await validateUKPostcode('NOTAPOSTCODE')
    expect(result).toBe(false)
  })

  it('should strip spaces before calling the API', async () => {
    const mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({ result: true }),
    }
    global.fetch = jest.fn().mockResolvedValue(mockResponse)

    await validateUKPostcode('SW1A 1AA')

    const calledUrl = (global.fetch as jest.Mock).mock.calls[0][0]
    expect(calledUrl).toContain('/postcodes/SW1A1AA/validate')
  })
})
