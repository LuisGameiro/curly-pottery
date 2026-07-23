import { deleteBlob } from './serverImages.action'
import { del } from '@vercel/blob'
import { auth } from '@/auth'

jest.mock('@vercel/blob', () => ({
  del: jest.fn(),
}))

describe('deleteBlob', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(auth as jest.Mock).mockResolvedValue({
      user: { id: 'admin-1', role: 'ADMIN' },
    })
  })

  it('should handle errors gracefully', async () => {
    const mockDel = del as jest.MockedFunction<typeof del>
    const mockError = new Error('Delete failed')
    mockDel.mockRejectedValue(mockError)

    const mockConsoleError = jest.spyOn(console, 'error').mockImplementation()

    await deleteBlob('blob-url')

    expect(mockConsoleError).toHaveBeenCalledWith(
      'Error deleting blobs:',
      mockError,
    )
    mockConsoleError.mockRestore()
  })

  it('should not throw when deletion fails', async () => {
    const mockDel = del as jest.MockedFunction<typeof del>
    mockDel.mockRejectedValue(new Error('Delete failed'))

    await expect(deleteBlob('blob-url')).resolves.toBeUndefined()
  })
})
