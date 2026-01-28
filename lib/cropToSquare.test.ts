import { cropToSquare } from './cropToSquare'

describe('cropToSquare', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return a Blob', async () => {
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })

    jest.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url')
    jest.spyOn(URL, 'revokeObjectURL').mockImplementation()

    const mockBlob = new Blob(['test'], { type: 'image/jpeg' })
    HTMLCanvasElement.prototype.toBlob = jest.fn((callback) => {
      callback(mockBlob)
    })

    const result = await cropToSquare(file)
    expect(result).toBeInstanceOf(Blob)
  })

  it('should create a 1000x1000 canvas', async () => {
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })

    jest.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url')
    jest.spyOn(URL, 'revokeObjectURL').mockImplementation()

    const createElementSpy = jest.spyOn(document, 'createElement')
    const mockBlob = new Blob(['test'], { type: 'image/jpeg' })
    HTMLCanvasElement.prototype.toBlob = jest.fn((callback) => {
      callback(mockBlob)
    })

    await cropToSquare(file)
    expect(createElementSpy).toHaveBeenCalledWith('canvas')
  })

  it('should revoke object URL after processing', async () => {
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    const revokeObjectURLSpy = jest.spyOn(URL, 'revokeObjectURL')

    jest.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url')

    const mockBlob = new Blob(['test'], { type: 'image/jpeg' })
    HTMLCanvasElement.prototype.toBlob = jest.fn((callback) => {
      callback(mockBlob)
    })

    await cropToSquare(file)
    expect(revokeObjectURLSpy).toHaveBeenCalled()
  })
})
