import { render, screen, fireEvent } from '@testing-library/react'
import { FormProvider, useForm } from 'react-hook-form'
import { VariantDetails } from './VariantDetails'

const MockWrapper = ({ children }: { children: React.ReactNode }) => {
  const methods = useForm({
    defaultValues: {
      variants: [{ details: [] }],
    },
  })
  return <FormProvider {...methods}>{children}</FormProvider>
}

describe('VariantDetails', () => {
  it('renders the component with heading', () => {
    render(
      <MockWrapper>
        <VariantDetails variantIndex={0} />
      </MockWrapper>,
    )
    expect(screen.getByText('Technical Details')).toBeInTheDocument()
  })

  it('renders Add Detail button', () => {
    render(
      <MockWrapper>
        <VariantDetails variantIndex={0} />
      </MockWrapper>,
    )
    expect(
      screen.getByRole('button', { name: /Add Detail/i }),
    ).toBeInTheDocument()
  })

  it('adds a new detail field when Add Detail button is clicked', () => {
    render(
      <MockWrapper>
        <VariantDetails variantIndex={0} />
      </MockWrapper>,
    )
    const addButton = screen.getByRole('button', { name: /Add Detail/i })
    fireEvent.click(addButton)
    expect(screen.getByDisplayValue('Materials')).toBeInTheDocument()
  })

  it('renders InputSelect and Input fields for each detail', () => {
    render(
      <MockWrapper>
        <VariantDetails variantIndex={0} />
      </MockWrapper>,
    )
    fireEvent.click(screen.getByRole('button', { name: /Add Detail/i }))
    const inputs = screen.getAllByRole('textbox')
    expect(inputs.length).toBeGreaterThan(0)
  })

  it('removes detail field when delete button is clicked', () => {
    render(
      <MockWrapper>
        <VariantDetails variantIndex={0} />
      </MockWrapper>,
    )
    fireEvent.click(screen.getByRole('button', { name: /Add Detail/i }))
    const deleteButton = screen.getByRole('button', { name: '' })
    fireEvent.click(deleteButton)
    expect(screen.queryByDisplayValue('Materials')).not.toBeInTheDocument()
  })
})
