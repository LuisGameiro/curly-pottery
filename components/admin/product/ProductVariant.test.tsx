import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useFormContext } from 'react-hook-form'
import { ProductVariant } from './ProductVariant'
import { skulify } from '@lib/skulify'

jest.mock('react-hook-form', () => ({
  useFormContext: jest.fn(),
  useFieldArray: jest.fn(),
  Controller: ({
    render,
  }: {
    render: (args: {
      field: { value: boolean; onChange: jest.Mock }
    }) => React.ReactNode
  }) => render({ field: { value: false, onChange: jest.fn() } }),
}))
jest.mock('@lib/skulify')
jest.mock('./VariantDetails', () => ({
  VariantDetails: () => <div>VariantDetails</div>,
}))
jest.mock('./VariantDiscounts', () => ({
  VariantDiscounts: () => <div>VariantDiscounts</div>,
}))

describe('ProductVariant', () => {
  const mockRegister = jest.fn(() => ({}))
  const mockWatch = jest.fn()
  const mockSetValue = jest.fn()
  const mockOnRemove = jest.fn()
  const mockOnMoveUp = jest.fn()
  const mockOnMoveDown = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useFormContext as jest.Mock).mockReturnValue({
      register: mockRegister,
      watch: mockWatch,
      setValue: mockSetValue,
      control: {},
      formState: { errors: {} },
    })
    ;(skulify as jest.Mock).mockReturnValue('PRODUCT-S-RED')
    mockWatch.mockImplementation((field: string) => {
      if (field === 'name') return 'Test Product'
      if (field.includes('sizeName')) return 'M'
      if (field.includes('colorName')) return 'Red'
      if (field.includes('isExpanded')) return false
      if (field.includes('sku')) return 'PRODUCT-S-RED'
      if (field.includes('.')) return { price: 29.99, isExpanded: false }
      return undefined
    })
  })

  it('renders variant with SKU', () => {
    render(
      <ProductVariant
        index={0}
        isFirst={true}
        isLast={false}
        onRemove={mockOnRemove}
        onMoveUp={mockOnMoveUp}
        onMoveDown={mockOnMoveDown}
      />,
    )
    expect(screen.getByText('PRODUCT-S-RED')).toBeInTheDocument()
  })

  it('displays price', () => {
    render(
      <ProductVariant
        index={0}
        isFirst={true}
        isLast={false}
        onRemove={mockOnRemove}
        onMoveUp={mockOnMoveUp}
        onMoveDown={mockOnMoveDown}
      />,
    )
    expect(screen.getByText('£29.99')).toBeInTheDocument()
  })

  it('toggles expanded state on header click', () => {
    render(
      <ProductVariant
        index={0}
        isFirst={true}
        isLast={false}
        onRemove={mockOnRemove}
        onMoveUp={mockOnMoveUp}
        onMoveDown={mockOnMoveDown}
      />,
    )
    const header = screen
      .getByText('PRODUCT-S-RED')
      .closest('div')?.parentElement
    fireEvent.click(header!)
    expect(mockSetValue).toHaveBeenCalledWith('variants.0.isExpanded', true)
  })

  it('disables move up button when isFirst is true', () => {
    render(
      <ProductVariant
        index={0}
        isFirst={true}
        isLast={false}
        onRemove={mockOnRemove}
        onMoveUp={mockOnMoveUp}
        onMoveDown={mockOnMoveDown}
      />,
    )
    const buttons = screen.getAllByRole('button')
    expect(buttons[0]).toBeDisabled()
  })

  it('disables move down button when isLast is true', () => {
    render(
      <ProductVariant
        index={0}
        isFirst={false}
        isLast={true}
        onRemove={mockOnRemove}
        onMoveUp={mockOnMoveUp}
        onMoveDown={mockOnMoveDown}
      />,
    )
    const buttons = screen.getAllByRole('button')
    expect(buttons[1]).toBeDisabled()
  })

  it('calls onRemove when delete button is clicked', () => {
    render(
      <ProductVariant
        index={0}
        isFirst={false}
        isLast={false}
        onRemove={mockOnRemove}
        onMoveUp={mockOnMoveUp}
        onMoveDown={mockOnMoveDown}
      />,
    )
    const buttons = screen.getAllByRole('button')
    fireEvent.click(buttons[2])
    expect(mockOnRemove).toHaveBeenCalled()
  })

  it('updates SKU when product name, size, or color changes', async () => {
    render(
      <ProductVariant
        index={0}
        isFirst={true}
        isLast={false}
        onRemove={mockOnRemove}
        onMoveUp={mockOnMoveUp}
        onMoveDown={mockOnMoveDown}
      />,
    )
    await waitFor(() => {
      expect(skulify).toHaveBeenCalledWith({
        name: 'Test Product',
        sizeName: 'M',
        colorName: 'Red',
      })
    })
  })

  it('calls onMoveUp when move up button is clicked', () => {
    render(
      <ProductVariant
        index={0}
        isFirst={false}
        isLast={false}
        onRemove={mockOnRemove}
        onMoveUp={mockOnMoveUp}
        onMoveDown={mockOnMoveDown}
      />,
    )
    const buttons = screen.getAllByRole('button')
    fireEvent.click(buttons[0])
    expect(mockOnMoveUp).toHaveBeenCalled()
  })

  it('calls onMoveDown when move down button is clicked', () => {
    render(
      <ProductVariant
        index={0}
        isFirst={false}
        isLast={false}
        onRemove={mockOnRemove}
        onMoveUp={mockOnMoveUp}
        onMoveDown={mockOnMoveDown}
      />,
    )
    const buttons = screen.getAllByRole('button')
    fireEvent.click(buttons[1])
    expect(mockOnMoveDown).toHaveBeenCalled()
  })

  it('renders expanded content when variant is expanded', () => {
    mockWatch.mockImplementation((field: string) => {
      if (field === 'name') return 'Test Product'
      if (field === 'variants.0.sizeName') return 'M'
      if (field === 'variants.0.colorName') return 'Red'
      if (field === 'variants.0.isExpanded') return true
      if (field === 'variants.0.sku') return 'PRODUCT-S-RED'
      if (field === 'variants.0')
        return { price: 29.99, stock: 10, isExpanded: true }
      return undefined
    })

    render(
      <ProductVariant
        index={0}
        isFirst={true}
        isLast={false}
        onRemove={mockOnRemove}
        onMoveUp={mockOnMoveUp}
        onMoveDown={mockOnMoveDown}
      />,
    )

    expect(screen.getByTestId('Price (£)')).toBeInTheDocument()
    expect(screen.getByTestId('Inventory Stock')).toBeInTheDocument()
    expect(screen.getByText('Size Variant')).toBeInTheDocument()
    expect(screen.getByText('Color Variant')).toBeInTheDocument()
    expect(screen.getByTestId('Available for Sale')).toBeInTheDocument()
    expect(screen.getByText('VariantDetails')).toBeInTheDocument()
    expect(screen.getByText('VariantDiscounts')).toBeInTheDocument()
    expect(screen.getByTestId('input-image')).toBeInTheDocument()
  })

  it('displays error messages when formState has variant errors', () => {
    ;(useFormContext as jest.Mock).mockReturnValue({
      register: mockRegister,
      watch: mockWatch,
      setValue: mockSetValue,
      control: {},
      formState: {
        errors: {
          variants: [
            {
              price: { message: 'Price must be positive' },
              stock: { message: 'Stock is required' },
            },
          ],
        },
      },
    })

    mockWatch.mockImplementation((field: string) => {
      if (field === 'name') return 'Test Product'
      if (field === 'variants.0.sizeName') return 'M'
      if (field === 'variants.0.colorName') return 'Red'
      if (field === 'variants.0.isExpanded') return true
      if (field === 'variants.0.sku') return 'PRODUCT-S-RED'
      if (field === 'variants.0')
        return { price: 29.99, stock: 10, isExpanded: true }
      return undefined
    })

    render(
      <ProductVariant
        index={0}
        isFirst={true}
        isLast={false}
        onRemove={mockOnRemove}
        onMoveUp={mockOnMoveUp}
        onMoveDown={mockOnMoveDown}
      />,
    )

    expect(screen.getByText('Price must be positive')).toBeInTheDocument()
    expect(screen.getByText('Stock is required')).toBeInTheDocument()
  })
})
