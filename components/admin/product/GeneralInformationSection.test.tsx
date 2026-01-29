import { render, screen } from '@testing-library/react'
import { FormProvider, useForm } from 'react-hook-form'
import GeneralInformationSection from './GeneralInformationSection'
import { Category } from '@lib/types/types'

jest.mock('@lib/slugify', () => ({
  slugify: (str: string) => str.toLowerCase().replace(/\s+/g, '-'),
}))

const mockCategories = [
  { id: '1', name: 'Vases' },
  { id: '2', name: 'Bowls' },
] as Category[]

function FormWrapper({ children }: { children: React.ReactNode }) {
  const form = useForm({
    defaultValues: {
      name: '',
      description: '',
      hide: false,
      requiresShipping: false,
      categoryIds: [],
      files: [],
      previews: [],
    },
  })
  return <FormProvider {...form}>{children}</FormProvider>
}

describe('GeneralInformationSection', () => {
  it('renders general information section', () => {
    render(
      <FormWrapper>
        <GeneralInformationSection categories={mockCategories} />
      </FormWrapper>,
    )
    const titles = screen.getAllByTestId('text-boxTitle')
    expect(titles).toHaveLength(3)
    expect(titles[0]).toHaveTextContent('General Information')
  })

  it('renders product name input', () => {
    render(
      <FormWrapper>
        <GeneralInformationSection categories={mockCategories} />
      </FormWrapper>,
    )
    expect(screen.getByTestId('Product Name')).toBeInTheDocument()
  })

  it('renders description textarea', () => {
    render(
      <FormWrapper>
        <GeneralInformationSection categories={mockCategories} />
      </FormWrapper>,
    )
    expect(screen.getByTestId('Description')).toBeInTheDocument()
  })

  it('renders category buttons', () => {
    render(
      <FormWrapper>
        <GeneralInformationSection categories={mockCategories} />
      </FormWrapper>,
    )
    expect(screen.getByText('Vases')).toBeInTheDocument()
    expect(screen.getByText('Bowls')).toBeInTheDocument()
  })

  it('renders checkboxes for hide and shipping', () => {
    render(
      <FormWrapper>
        <GeneralInformationSection categories={mockCategories} />
      </FormWrapper>,
    )
    expect(screen.getByTestId('Hide product from store')).toBeInTheDocument()
    expect(screen.getByTestId('Requires Shipping')).toBeInTheDocument()
  })

  it('renders product image input', () => {
    render(
      <FormWrapper>
        <GeneralInformationSection categories={mockCategories} />
      </FormWrapper>,
    )
    expect(screen.getByTestId('input-image')).toBeInTheDocument()
  })
})
