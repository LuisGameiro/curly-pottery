import { render, screen, fireEvent } from '@testing-library/react'
import { useFormContext, useFieldArray } from 'react-hook-form'
import { VariantDiscounts } from './VariantDiscounts'

jest.mock('react-hook-form')

jest.mock('lucide-react', () => ({
  Plus: () => <span>+</span>,
  Trash2: () => <span>🗑</span>,
}))

describe('VariantDiscounts', () => {
  const mockAppend = jest.fn()
  const mockRemove = jest.fn()
  const mockRegister = jest.fn(() => ({}))
  const mockWatch = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useFormContext as jest.Mock).mockReturnValue({
      control: {},
      register: mockRegister,
      watch: mockWatch,
    })
    ;(useFieldArray as jest.Mock).mockReturnValue({
      fields: [],
      append: mockAppend,
      remove: mockRemove,
    })
  })

  it('should render the discounts section', () => {
    render(<VariantDiscounts variantIndex={0} />)
    expect(screen.getByTestId('text-subHeading')).toHaveTextContent('Discounts')
  })

  it('should render add discount button', () => {
    render(<VariantDiscounts variantIndex={0} />)
    expect(screen.getByText('Add Discount')).toBeInTheDocument()
  })

  it('should append discount on add button click', () => {
    render(<VariantDiscounts variantIndex={0} />)
    fireEvent.click(screen.getByText('Add Discount'))
    expect(mockAppend).toHaveBeenCalledWith({
      code: '',
      type: 'PERCENTAGE',
      value: 0,
    })
  })

  it('renders existing discount fields', () => {
    ;(useFieldArray as jest.Mock).mockReturnValue({
      fields: [{ id: 'discount-1' }, { id: 'discount-2' }],
      append: mockAppend,
      remove: mockRemove,
    })
    mockWatch.mockImplementation((field: string) => {
      if (field.includes('type')) return 'PERCENTAGE'
      return undefined
    })

    render(<VariantDiscounts variantIndex={0} />)

    const codeLabels = screen.getAllByText('Code')
    expect(codeLabels).toHaveLength(2)

    const removeButtons = screen.getAllByText('🗑')
    expect(removeButtons).toHaveLength(2)
  })

  it('calls remove with the correct index when remove button is clicked', () => {
    ;(useFieldArray as jest.Mock).mockReturnValue({
      fields: [{ id: 'discount-1' }, { id: 'discount-2' }],
      append: mockAppend,
      remove: mockRemove,
    })
    mockWatch.mockImplementation((field: string) => {
      if (field.includes('type')) return 'PERCENTAGE'
      return undefined
    })

    render(<VariantDiscounts variantIndex={0} />)

    const removeButtons = screen.getAllByText('🗑')
    fireEvent.click(removeButtons[0])
    expect(mockRemove).toHaveBeenCalledWith(0)

    fireEvent.click(removeButtons[1])
    expect(mockRemove).toHaveBeenCalledWith(1)
  })

  it('shows "%" label when discount type is PERCENTAGE', () => {
    ;(useFieldArray as jest.Mock).mockReturnValue({
      fields: [{ id: 'discount-1' }],
      append: mockAppend,
      remove: mockRemove,
    })
    mockWatch.mockImplementation((field: string) => {
      if (field.includes('type')) return 'PERCENTAGE'
      return undefined
    })

    render(<VariantDiscounts variantIndex={0} />)
    expect(screen.getByText('%')).toBeInTheDocument()
  })

  it('shows "Fixed" label when discount type is FIXED_AMOUNT', () => {
    ;(useFieldArray as jest.Mock).mockReturnValue({
      fields: [{ id: 'discount-1' }],
      append: mockAppend,
      remove: mockRemove,
    })
    mockWatch.mockImplementation((field: string) => {
      if (field.includes('type')) return 'FIXED_AMOUNT'
      return undefined
    })

    render(<VariantDiscounts variantIndex={0} />)
    expect(screen.getByText('Fixed')).toBeInTheDocument()
  })
})
