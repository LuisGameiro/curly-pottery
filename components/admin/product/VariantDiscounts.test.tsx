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
})
