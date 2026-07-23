import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/navigation'
import CategoryClient from './CategoryClient'
import { Category } from '@lib/types/types'

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

jest.mock('@actions/category.actions', () => ({
  upsertCategory: jest.fn(),
}))

jest.mock('@lib/client-images', () => ({
  syncImages: jest.fn(),
}))

jest.mock('sonner', () => ({
  toast: jest.fn(),
}))

jest.mock('@lib/slugify', () => ({
  slugify: jest.fn((text: string) => text.toLowerCase().replace(/\s+/g, '-')),
}))

jest.mock('lucide-react', () => ({
  ArrowLeft: () => <svg data-testid="arrow-left-icon" />,
}))

jest.mock('next/link', () => {
  const a = ({
    href,
    children,
    ...props
  }: {
    href: string
    children: React.ReactNode
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  )
  return a
})

const mockRouter = {
  replace: jest.fn(),
  refresh: jest.fn(),
}

// const mockUpsertCategory = jest.requireMock(
//   '@actions/category.actions',
// ).upsertCategory
// const mockSyncImages = jest.requireMock('@lib/client-images').syncImages
// const mockToast = jest.requireMock('sonner').toast
// const mockSlugify = jest.requireMock('@lib/slugify').slugify

if (typeof window.URL.createObjectURL === 'undefined') {
  window.URL.createObjectURL = jest.fn(() => 'mock-url')
}

describe('CategoryClient', () => {
  const mockCategory = {
    id: '1',
    name: 'Test Category',
    slug: 'test-category',
    image: 'test-image.jpg',
  } as Category

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
    // expect(mockSlugify).toHaveBeenCalledWith('Home Decor')
  })

  // it('should handle successful form submission', async () => {
  //   mockSyncImages.mockResolvedValue({
  //     success: true,
  //     data: ['new-image.jpg'],
  //   })
  //   mockUpsertCategory.mockResolvedValue({ success: true })

  //   render(<CategoryClient category={null} isEditMode={false} />)
  //   const input = screen.getByPlaceholderText('e.g. Home Decor')
  //   const submitButton = screen.getByText('Create Category')

  //   fireEvent.change(input, { target: { value: 'Test' } })
  //   const file = new File(['hello'], 'test.png', { type: 'image/png' })
  //   const imageInput = screen.getByPlaceholderText('Category Image')
  //   fireEvent.change(imageInput, { target: { files: [file] } })

  //   fireEvent.click(submitButton)

  //   await waitFor(() => {
  //     expect(mockSyncImages).toHaveBeenCalled()
  //     expect(mockUpsertCategory).toHaveBeenCalledWith({
  //       name: 'Test',
  //       image: 'new-image.jpg',
  //     })
  //     expect(mockRouter.replace).toHaveBeenCalledWith('/admin/categories')
  //     expect(mockRouter.refresh).toHaveBeenCalled()
  //   })
  // })

  // it('should display toast on sync images failure', async () => {
  //   mockSyncImages.mockResolvedValue({
  //     success: false,
  //     message: 'Image sync failed',
  //   })

  //   render(<CategoryClient category={null} isEditMode={false} />)
  //   const submitButton = screen.getByText('Create Category')

  //   fireEvent.click(submitButton)

  //   await waitFor(() => {
  //     expect(mockToast).toHaveBeenCalledWith('Image sync failed')
  //   })
  // })

  // it('should display toast on upsert category failure', async () => {
  //   mockSyncImages.mockResolvedValue({
  //     success: true,
  //     data: ['new-image.jpg'],
  //   })
  //   mockUpsertCategory.mockResolvedValue({
  //     success: false,
  //     message: 'Category save failed',
  //   })

  //   render(<CategoryClient category={null} isEditMode={false} />)
  //   const submitButton = screen.getByText('Create Category')

  //   fireEvent.click(submitButton)

  //   await waitFor(() => {
  //     expect(mockToast).toHaveBeenCalledWith('Image sync failed') // This is from the syncImages success
  //   })
  // })

  // it('should handle form validation errors', async () => {
  //   render(<CategoryClient category={null} isEditMode={false} />)
  //   const submitButton = screen.getByText('Create Category')

  //   // Submit without filling required fields
  //   fireEvent.click(submitButton)

  //   // Wait for validation to run
  //   await waitFor(() => {
  //     expect(mockSyncImages).not.toHaveBeenCalled()
  //     expect(mockUpsertCategory).not.toHaveBeenCalled()
  //   })
  // })

  // it('should render back link', () => {
  //   render(<CategoryClient category={null} isEditMode={false} />)
  //   const backLink = screen.getByText('Back to Categories')
  //   expect(backLink).toHaveAttribute('href', '/admin/categories')
  // })
})
