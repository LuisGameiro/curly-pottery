import { syncImages } from '@lib/client-images'
import { upload } from '@vercel/blob/client'
import { deleteBlob } from './serverImages.action'
import { cropToSquare } from '@lib/cropToSquare'

jest.mock('@vercel/blob/client')
jest.mock('./serverImages.action')
jest.mock('@lib/cropToSquare')

const ORIGINAL_NODE_ENV = process.env.NODE_ENV

function setNodeEnv(value: string | undefined) {
  // NODE_ENV is typed read-only on process.env — cast to assign it.
  ;(process.env as Record<string, string | undefined>).NODE_ENV = value
}

describe('syncImages', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    delete process.env.NEXT_PUBLIC_APP_ENV
  })

  afterEach(() => {
    setNodeEnv(ORIGINAL_NODE_ENV)
  })

  it('should return random images in dev mode', async () => {
    // The dev branch in lib/client-images requires BOTH NODE_ENV=development
    // and NEXT_PUBLIC_APP_ENV=dev (Jest runs with NODE_ENV=test by default).
    setNodeEnv('development')
    process.env.NEXT_PUBLIC_APP_ENV = 'dev'
    const result = await syncImages({
      currentItems: ['file1', 'file2'],
      existingUrls: [],
    })

    expect(result.success).toBe(true)
    expect(result.message).toBe('Sync images skipped in development mode')
    expect(result.data).toHaveLength(2)
  })

  it('should delete old urls not in current items', async () => {
    ;(cropToSquare as jest.Mock).mockResolvedValue(new Blob())
    ;(upload as jest.Mock).mockResolvedValue({ url: 'new-url' })

    await syncImages({
      currentItems: ['string-url'],
      existingUrls: ['old-url-1', 'old-url-2'],
    })

    expect(deleteBlob).toHaveBeenCalledWith('old-url-1')
    expect(deleteBlob).toHaveBeenCalledWith('old-url-2')
  })

  it('should upload new files and return urls', async () => {
    const mockFile = new File(['content'], 'image.jpg')
    ;(cropToSquare as jest.Mock).mockResolvedValue(new Blob())
    ;(upload as jest.Mock).mockResolvedValue({ url: 'blob-url' })

    const result = await syncImages({
      currentItems: [mockFile],
      existingUrls: [],
    })

    expect(result.success).toBe(true)
    expect(result.data).toEqual(['blob-url'])
    expect(upload).toHaveBeenCalled()
  })

  it('should handle errors and return failure response', async () => {
    ;(upload as jest.Mock).mockRejectedValue(new Error('Upload failed'))

    const result = await syncImages({
      currentItems: [new File(['content'], 'image.jpg')],
      existingUrls: [],
    })

    expect(result.success).toBe(false)
    expect(result.message).toBe('Upload failed')
  })
})
