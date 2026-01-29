import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/navigation'
import CategoryClient from './CategoryClient'
import { upsertCategory } from 'actions/category.actions'
import { syncImages } from 'actions/images.actions'
import { toast } from 'sonner'
import { Category } from '@lib/types/types'

jest.mock('next/navigation')
jest.mock('actions/category.actions')
jest.mock('actions/images.actions')
jest.mock('sonner')
jest.mock('@lib/slugify', () => ({
  slugify: jest.fn((text) => text.toLowerCase().replace(/\s+/g, '-')),
}))

const mockRouter = {
  replace: jest.fn(),
  refresh: jest.fn(),
}

const mockCategory = {
  id: '1',
  name: 'Test Category',
  slug: 'test-category',
  image: 'test-image.jpg',
} as Category

describe('CategoryClient', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
  })

  it('should render create mode when isEditMode is false', () => {
    render(<CategoryClient category={null} isEditMode={false} />)
    expect(screen.getByText('New Category')).toBeInTheDocument()
    expect(screen.getByText('Create Category')).toBeInTheDocument()
  })

  it('should render edit mode when isEditMode is true', () => {
    render(<CategoryClient category={mockCategory} isEditMode={true} />)
    expect(screen.getByText('Edit Category')).toBeInTheDocument()
    expect(screen.getByText('Save Category')).toBeInTheDocument()
  })

  it('should populate form with category data in edit mode', () => {
    render(<CategoryClient category={mockCategory} isEditMode={true} />)
    const input = screen.getByPlaceholderText(
      'e.g. Home Decor',
    ) as HTMLInputElement
    expect(input.value).toBe('Test Category')
  })

  it('should update form data on input change', async () => {
    const user = userEvent.setup()
    render(<CategoryClient category={null} isEditMode={false} />)
    const input = screen.getByPlaceholderText('e.g. Home Decor')

    await user.clear(input)
    await user.type(input, 'New Category')

    expect(input).toHaveValue('New Category')
  })

  it('should display slug preview', () => {
    render(<CategoryClient category={null} isEditMode={false} />)
    const input = screen.getByPlaceholderText('e.g. Home Decor')
    fireEvent.change(input, { target: { value: 'Home Decor' } })

    expect(screen.getByText('/home-decor')).toBeInTheDocument()
  })

  it('should handle successful form submission', async () => {
    ;(syncImages as jest.Mock).mockResolvedValue({
      success: true,
      data: ['new-image.jpg'],
    })
    ;(upsertCategory as jest.Mock).mockResolvedValue({ success: true })

    render(<CategoryClient category={null} isEditMode={false} />)
    const input = screen.getByPlaceholderText('e.g. Home Decor')
    const submitButton = screen.getByText('Create Category')

    fireEvent.change(input, { target: { value: 'Test' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockRouter.replace).toHaveBeenCalledWith('/admin/categories')
      expect(mockRouter.refresh).toHaveBeenCalled()
    })
  })

  it('should show loading state during submission', async () => {
    ;(syncImages as jest.Mock).mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () => resolve({ success: true, data: ['image.jpg'] }),
            100,
          ),
        ),
    )
    ;(upsertCategory as jest.Mock).mockResolvedValue({ success: true })

    const submitButton = screen.getByText('Create Category')

    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })
  })

  it('should display toast on sync images failure', async () => {
    ;(syncImages as jest.Mock).mockResolvedValue({
      success: false,
      message: 'Image sync failed',
    })

    render(<CategoryClient category={null} isEditMode={false} />)
    const submitButton = screen.getByText('Create Category')

    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith('Image sync failed')
    })
  })

  it('should render back link', () => {
    render(<CategoryClient category={null} isEditMode={false} />)
    const backLink = screen.getByText('Back to Categories')
    expect(backLink).toHaveAttribute('href', '/admin/categories')
  })
})
