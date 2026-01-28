import { cropToSquare } from './cropToSquare'

describe('cropToSquare', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return a Blob', async () => {
    const mockBitmap = {
      width: 2000,
      height: 1000,
    }

    global.createImageBitmap = jest
      .fn()
      .mockResolvedValueOnce(mockBitmap)
      .mockResolvedValueOnce(mockBitmap)

    const mockBlob = new Blob(['test'], { type: 'image/jpeg' })
    const mockOffscreenCanvas = {
      getContext: jest.fn().mockReturnValue({
        drawImage: jest.fn(),
      }),
      convertToBlob: jest.fn().mockResolvedValue(mockBlob),
    }

    global.OffscreenCanvas = jest
      .fn()
      .mockImplementation(() => mockOffscreenCanvas)

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    const result = await cropToSquare(file)

    expect(result).toBeInstanceOf(Blob)
    expect(result.type).toBe('image/jpeg')
  })

  it('should crop to center square from wider image', async () => {
    const mockBitmap = { width: 2000, height: 1000 }

    global.createImageBitmap = jest
      .fn()
      .mockResolvedValueOnce(mockBitmap)
      .mockResolvedValueOnce(mockBitmap)

    const mockOffscreenCanvas = {
      getContext: jest.fn().mockReturnValue({ drawImage: jest.fn() }),
      convertToBlob: jest.fn().mockResolvedValue(new Blob()),
    }

    global.OffscreenCanvas = jest
      .fn()
      .mockImplementation(() => mockOffscreenCanvas)

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    await cropToSquare(file)

    expect(global.createImageBitmap).toHaveBeenCalledWith(
      mockBitmap,
      500,
      0,
      1000,
      1000,
      { resizeWidth: 1000, resizeHeight: 1000 },
    )
  })

  it('should create OffscreenCanvas with correct dimensions', async () => {
    const mockBitmap = { width: 1500, height: 1500 }

    global.createImageBitmap = jest
      .fn()
      .mockResolvedValueOnce(mockBitmap)
      .mockResolvedValueOnce(mockBitmap)

    const mockOffscreenCanvas = {
      getContext: jest.fn().mockReturnValue({ drawImage: jest.fn() }),
      convertToBlob: jest.fn().mockResolvedValue(new Blob()),
    }

    global.OffscreenCanvas = jest
      .fn()
      .mockImplementation(() => mockOffscreenCanvas)

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    await cropToSquare(file)

    expect(global.OffscreenCanvas).toHaveBeenCalledWith(1000, 1000)
  })
})
