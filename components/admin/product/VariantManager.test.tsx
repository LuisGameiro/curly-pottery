import { render, screen, fireEvent } from '@testing-library/react'
import { useFormContext, useFieldArray } from 'react-hook-form'
import { toast } from 'sonner'
import { VariantManager } from './VariantManager'

jest.mock('react-hook-form')
jest.mock('sonner')

jest.mock('lucide-react', () => ({
  Plus: ({ size }: { size: number }) => (
    <span data-testid="plus-icon">{size}</span>
  ),
}))
jest.mock('./ProductVariant', () => ({
  ProductVariant: ({
    index,
    onRemove,
    onMoveUp,
    onMoveDown,
  }: {
    index: number
    onRemove: () => void
    onMoveUp: () => void
    onMoveDown: () => void
  }) => (
    <div data-testid={`variant-${index}`}>
      <button onClick={onMoveUp} data-testid={`move-up-${index}`}>
        Move Up
      </button>
      <button onClick={onMoveDown} data-testid={`move-down-${index}`}>
        Move Down
      </button>
      <button onClick={onRemove} data-testid={`remove-${index}`}>
        Remove
      </button>
    </div>
  ),
}))

describe('VariantManager', () => {
  const mockAppend = jest.fn()
  const mockRemove = jest.fn()
  const mockMove = jest.fn()
  const mockControl = {}

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useFormContext as jest.Mock).mockReturnValue({
      control: mockControl,
    })
  })

  it('renders variant manager with title', () => {
    ;(useFieldArray as jest.Mock).mockReturnValue({
      fields: [],
      append: mockAppend,
      remove: mockRemove,
      move: mockMove,
    })

    render(<VariantManager />)
    expect(screen.getByText('Variants')).toBeInTheDocument()
  })

  it('displays field count', () => {
    ;(useFieldArray as jest.Mock).mockReturnValue({
      fields: [{}, {}],
      append: mockAppend,
      remove: mockRemove,
      move: mockMove,
    })

    render(<VariantManager />)
    expect(screen.getByText('(2)')).toBeInTheDocument()
  })

  it('adds a new variant when Add Variant button is clicked', () => {
    ;(useFieldArray as jest.Mock).mockReturnValue({
      fields: [],
      append: mockAppend,
      remove: mockRemove,
      move: mockMove,
    })

    render(<VariantManager />)
    const addButton = screen.getByRole('button', { name: /Add Variant/i })

    fireEvent.click(addButton)

    expect(mockAppend).toHaveBeenCalledWith({
      id: 'temp-1',
      sku: '',
      price: 0,
      stock: 0,
      details: [],
      discounts: [],
      files: [],
      previews: [],
      sizeName: 'M',
      colorName: '',
      availableForSale: true,
      isExpanded: true,
      currency: 'USD',
      colorHex: 'FFFFFF',
      images: [],
    })
  })

  it('shows error toast when trying to remove last variant', () => {
    ;(useFieldArray as jest.Mock).mockReturnValue({
      fields: [{ id: '1' }],
      append: mockAppend,
      remove: mockRemove,
      move: mockMove,
    })

    render(<VariantManager />)
    const removeButton = screen.getByTestId('remove-0')

    window.confirm = jest.fn(() => true)
    fireEvent.click(removeButton)

    expect(toast.error).toHaveBeenCalledWith(
      'Product must have at least one variant.',
    )
    expect(mockRemove).not.toHaveBeenCalled()
  })

  it('removes variant when confirmed and more than one variant exists', () => {
    ;(useFieldArray as jest.Mock).mockReturnValue({
      fields: [{ id: '1' }, { id: '2' }],
      append: mockAppend,
      remove: mockRemove,
      move: mockMove,
    })

    render(<VariantManager />)
    const removeButton = screen.getByTestId('remove-0')

    window.confirm = jest.fn(() => true)
    fireEvent.click(removeButton)

    expect(mockRemove).toHaveBeenCalledWith(0)
  })

  it('does not remove variant when removal is not confirmed', () => {
    ;(useFieldArray as jest.Mock).mockReturnValue({
      fields: [{ id: '1' }, { id: '2' }],
      append: mockAppend,
      remove: mockRemove,
      move: mockMove,
    })

    render(<VariantManager />)
    const removeButton = screen.getByTestId('remove-0')

    window.confirm = jest.fn(() => false)
    fireEvent.click(removeButton)

    expect(mockRemove).not.toHaveBeenCalled()
  })

  it('renders ProductVariant components for each field', () => {
    ;(useFieldArray as jest.Mock).mockReturnValue({
      fields: [{ id: '1' }, { id: '2' }, { id: '3' }],
      append: mockAppend,
      remove: mockRemove,
      move: mockMove,
    })

    render(<VariantManager />)

    expect(screen.getByTestId('variant-0')).toBeInTheDocument()
    expect(screen.getByTestId('variant-1')).toBeInTheDocument()
    expect(screen.getByTestId('variant-2')).toBeInTheDocument()
  })

  it('calls move with correct indices when moving variants', () => {
    ;(useFieldArray as jest.Mock).mockReturnValue({
      fields: [{ id: '1' }, { id: '2' }],
      append: mockAppend,
      remove: mockRemove,
      move: mockMove,
    })

    render(<VariantManager />)

    fireEvent.click(screen.getByTestId('move-down-0'))
    expect(mockMove).toHaveBeenCalledWith(0, 1)

    fireEvent.click(screen.getByTestId('move-up-1'))
    expect(mockMove).toHaveBeenCalledWith(1, 0)
  })
})
