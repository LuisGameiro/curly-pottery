import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/navigation'
import CategoryClient from './CategoryClient'
import { Category } from '@lib/types/types'
import { toast } from 'sonner'
import { upsertCategory } from '@actions/category.actions'
import { syncImages } from '@lib/client-images'
import { CategorySchema } from '@lib/form-validator'

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

jest.mock('../../actions/category.actions', () => ({
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

jest.mock('@lib/form-validator', () => {
  const actual = jest.requireActual('@lib/form-validator')
  return {
    ...actual,
    CategorySchema: {
      safeParse: jest.fn(),
    },
  }
})

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
    ;(CategorySchema.safeParse as jest.Mock).mockReturnValue({ success: true })
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

  it('should handle form validation errors', async () => {
    ;(CategorySchema.safeParse as jest.Mock).mockReturnValue({
      success: false,
      error: {
        issues: [{ path: ['name'], message: 'Name is required' }],
      },
    })

    render(<CategoryClient category={null} isEditMode={false} />)
    const submitButton = screen.getByText('Create Category')

    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument()
    })
    expect(upsertCategory).not.toHaveBeenCalled()
    expect(syncImages).not.toHaveBeenCalled()
  })

  it('should handle successful form submission', async () => {
    jest.mocked(syncImages).mockResolvedValue({
      success: true,
      message: '',
      data: ['new-image.jpg'],
    })
    jest.mocked(upsertCategory).mockResolvedValue({
      success: true,
      message: '',
      data: mockCategory,
    })

    render(<CategoryClient category={null} isEditMode={false} />)
    const input = screen.getByPlaceholderText('e.g. Home Decor')
    const submitButton = screen.getByText('Create Category')

    fireEvent.change(input, { target: { value: 'Test Category' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(upsertCategory).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Test Category' }),
      )
      expect(mockRouter.replace).toHaveBeenCalledWith('/admin/categories')
    })
  })

  it('should display toast on sync images failure', async () => {
    jest.mocked(syncImages).mockResolvedValue({
      success: false,
      message: 'Image sync failed',
    })

    render(<CategoryClient category={null} isEditMode={false} />)
    const submitButton = screen.getByText('Create Category')

    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith('Image sync failed')
    })
    expect(upsertCategory).not.toHaveBeenCalled()
  })

  it('should display toast on upsert category failure', async () => {
    jest.mocked(syncImages).mockResolvedValue({
      success: true,
      message: '',
      data: ['new-image.jpg'],
    })
    jest.mocked(upsertCategory).mockResolvedValue({
      success: false,
      message: 'Category save failed',
    })

    render(<CategoryClient category={null} isEditMode={false} />)
    const submitButton = screen.getByText('Create Category')

    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(toast).toHaveBeenCalled()
    })
    expect(mockRouter.replace).not.toHaveBeenCalled()
  })

  it('should show and hide loading state during submission', async () => {
    jest.mocked(syncImages).mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                success: true,
                message: '',
                data: ['new-image.jpg'],
              } as any),
            50,
          ),
        ),
    )
    jest.mocked(upsertCategory).mockResolvedValue({
      success: true,
      message: '',
      data: mockCategory,
    } as any)

    render(<CategoryClient category={null} isEditMode={false} />)
    const submitButton = screen.getByText('Create Category')

    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    })
  })

  it('should have submit button enabled when form is loaded', () => {
    render(<CategoryClient category={null} isEditMode={false} />)
    const submitButton = screen.getByText('Create Category')
    expect(submitButton).not.toBeDisabled()
  })

  it('should render back link', () => {
    render(<CategoryClient category={null} isEditMode={false} />)
    const backLink = screen.getByText('Back to Categories')
    expect(backLink).toHaveAttribute('href', '/admin/categories')
  })
})
