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
    expect(screen.getByTestId('button-success')).toBeInTheDocument()
  })

  it('should append discount on add button click', () => {
    render(<VariantDiscounts variantIndex={0} />)
    fireEvent.click(screen.getByTestId('button-success'))
    expect(mockAppend).toHaveBeenCalledWith({
      code: '',
      type: 'PERCENTAGE',
      value: 0,
    })
  })

  it('should render discount fields for each field in array', () => {
    ;(useFieldArray as jest.Mock).mockReturnValue({
      fields: [{ id: '1' }, { id: '2' }],
      append: mockAppend,
      remove: mockRemove,
    })
    mockWatch.mockReturnValue('PERCENTAGE')

    render(<VariantDiscounts variantIndex={0} />)
    expect(screen.getAllByTestId(/^input-/)).toHaveLength(4)
  })

  it('should remove discount on delete button click', () => {
    ;(useFieldArray as jest.Mock).mockReturnValue({
      fields: [{ id: '1' }],
      append: mockAppend,
      remove: mockRemove,
    })
    mockWatch.mockReturnValue('PERCENTAGE')

    render(<VariantDiscounts variantIndex={0} />)
    fireEvent.click(screen.getByTestId('button-danger'))
    expect(mockRemove).toHaveBeenCalledWith(0)
  })

  // it('should display percentage label when type is PERCENTAGE', () => {
  //     ;(useFieldArray as jest.Mock).mockReturnValue({
  //         fields: [{ id: '1' }],
  //         append: mockAppend,
  //         remove: mockRemove,
  //     })
  //     mockWatch.mockReturnValue('PERCENTAGE')

  //     render(<VariantDiscounts variantIndex={0} />)
  //     expect(screen.getByTestId('input-')).toHaveAttribute('value', expect.any(String))
  // })
})
