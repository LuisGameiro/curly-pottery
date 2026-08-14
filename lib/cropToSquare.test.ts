import { cropToSquare } from './cropToSquare'

describe('cropToSquare', () => {
  const drawImage = jest.fn()
  const canvases: HTMLCanvasElement[] = []
  let imageSize = { width: 1000, height: 1000 }

  // jsdom keeps the same document across tests in a file, so capture the real
  // createElement ONCE at module scope — capturing it inside beforeEach would
  // bind the previous test's mock and nest mocks recursively.
  const realCreateElement = document.createElement.bind(document)

  // jsdom cannot decode images, so mock the Image class: assigning `src`
  // fires `onload` asynchronously, like a real browser.
  class MockImage {
    naturalWidth = imageSize.width
    naturalHeight = imageSize.height
    onload: (() => void) | null = null
    onerror: (() => void) | null = null

    set src(_value: string) {
      queueMicrotask(() => this.onload?.())
    }
  }

  beforeEach(() => {
    jest.clearAllMocks()
    canvases.length = 0
    imageSize = { width: 1000, height: 1000 }

    // jsdom does not implement blob URLs — polyfill them.
    URL.createObjectURL = jest.fn(() => 'blob:mock-url')
    URL.revokeObjectURL = jest.fn()

    global.Image = MockImage as unknown as typeof Image

    // jsdom canvases cannot be drawn on (getContext returns null) and their
    // toBlob never calls back — stub both.
    document.createElement = jest.fn(
      (tag: string, options?: ElementCreationOptions) => {
        const element = realCreateElement(tag, options)
        if (tag === 'canvas') canvases.push(element as HTMLCanvasElement)
        return element
      },
    ) as typeof document.createElement

    HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
      drawImage,
    })) as unknown as typeof HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.toBlob = jest.fn((callback: BlobCallback) => {
      callback(new Blob(['cropped'], { type: 'image/jpeg' }))
    }) as unknown as typeof HTMLCanvasElement.prototype.toBlob
  })

  afterEach(() => {
    document.createElement = realCreateElement
  })

  it('should return a Blob', async () => {
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    const result = await cropToSquare(file)

    expect(result).toBeInstanceOf(Blob)
    expect(result.type).toBe('image/jpeg')
  })

  it('should crop to center square from wider image', async () => {
    imageSize = { width: 2000, height: 1000 }
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })

    await cropToSquare(file)

    expect(drawImage).toHaveBeenCalledWith(
      expect.any(MockImage),
      500,
      0,
      1000,
      1000, // source: center square
      0,
      0,
      1000,
      1000, // dest: 1000x1000
    )
  })

  it('should create canvas with correct dimensions', async () => {
    imageSize = { width: 1500, height: 1500 }
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })

    await cropToSquare(file)

    expect(canvases).toHaveLength(1)
    expect(canvases[0].width).toBe(1000)
    expect(canvases[0].height).toBe(1000)
  })
})
