import { getAppUrl, resolveSiteUrl } from './site-url'

const ORIGINAL_URL = process.env.NEXT_PUBLIC_APP_URL

afterEach(() => {
  process.env.NEXT_PUBLIC_APP_URL = ORIGINAL_URL
})

describe('getAppUrl', () => {
  it('should throw when env is not set', () => {
    delete process.env.NEXT_PUBLIC_APP_URL
    expect(() => getAppUrl()).toThrow('NEXT_PUBLIC_APP_URL is not configured.')
  })

  it('should return URL as-is when it has http:// prefix', () => {
    process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'
    expect(getAppUrl()).toBe('http://localhost:3000')
  })

  it('should return URL as-is when it has https:// prefix', () => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://curlypottery.com'
    expect(getAppUrl()).toBe('https://curlypottery.com')
  })

  it('should prepend https:// when no protocol is present', () => {
    process.env.NEXT_PUBLIC_APP_URL = 'curlypottery.com'
    expect(getAppUrl()).toBe('https://curlypottery.com')
  })

  it('should strip trailing slashes', () => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://curlypottery.com///'
    expect(getAppUrl()).toBe('https://curlypottery.com')
  })

  it('should strip trailing slashes when prepending https://', () => {
    process.env.NEXT_PUBLIC_APP_URL = 'curlypottery.com/'
    expect(getAppUrl()).toBe('https://curlypottery.com')
  })
})

describe('resolveSiteUrl', () => {
  it('should resolve a relative path against the app URL', () => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://curlypottery.com'
    expect(resolveSiteUrl('/products/vase')).toBe(
      'https://curlypottery.com/products/vase',
    )
  })

  it('should resolve a full URL and return it as a string', () => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://curlypottery.com'
    expect(resolveSiteUrl(new URL('https://other.com/path'))).toBe(
      'https://other.com/path',
    )
  })
})
