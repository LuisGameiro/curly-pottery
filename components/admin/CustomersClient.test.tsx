import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import CustomersClient from './CustomersClient'
import { UserWithOrders } from '@lib/types/types'
import { User } from '@sentry/nextjs'

jest.mock('@components/ui', () => ({
  Container: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  Text: ({
    children,
    variant,
    className,
  }: {
    children: React.ReactNode
    variant: string
    className: string
  }) => <div className={`${variant} ${className}`}>{children}</div>,
}))

jest.mock('@components/ui/Input/InputSearch', () => {
  return function MockInputSearch({
    value,
    onValueChange,
    placeholder,
  }: {
    value: string
    onValueChange: (value: string) => void
    placeholder: string
  }) {
    return (
      <input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        data-testid="search-input"
      />
    )
  }
})

jest.mock('@components/tables/CustomerTable', () => {
  return function MockCustomerTable({ customers }: { customers: User[] }) {
    return <div data-testid="customer-table">{customers.length} customers</div>
  }
})

describe('CustomersClient', () => {
  const createMockUser = (overrides: Partial<UserWithOrders>): UserWithOrders =>
    ({
      id: 'mock-id',
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      password: 'hashedpassword',
      role: 'USER',
      acceptsMarketing: false,
      emailVerified: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      phone: null,
      orders: [],
      ...overrides,
    }) as unknown as UserWithOrders

  const mockCustomers: UserWithOrders[] = [
    createMockUser({
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
    }),
    createMockUser({
      id: '2',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
    }),
    createMockUser({
      id: '3',
      firstName: 'Bob',
      lastName: 'Johnson',
      email: 'bob@example.com',
    }),
  ]

  it('renders customers heading', () => {
    render(<CustomersClient customers={mockCustomers} />)
    expect(screen.getByText('Customers')).toBeInTheDocument()
  })

  it('renders search input with correct placeholder', () => {
    render(<CustomersClient customers={mockCustomers} />)
    expect(
      screen.getByPlaceholderText('Search by name or email...'),
    ).toBeInTheDocument()
  })

  it('renders all customers initially', () => {
    render(<CustomersClient customers={mockCustomers} />)
    expect(screen.getByText('3 customers')).toBeInTheDocument()
  })

  it('filters customers by first name', () => {
    render(<CustomersClient customers={mockCustomers} />)
    const input = screen.getByTestId('search-input') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'jane smi' } })
    expect(screen.getByText('1 customers')).toBeInTheDocument()
  })

  it('filters customers by email', () => {
    render(<CustomersClient customers={mockCustomers} />)
    const input = screen.getByTestId('search-input') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'jane@example.com' } })
    expect(screen.getByText('1 customers')).toBeInTheDocument()
  })

  it('handles case-insensitive search', () => {
    render(<CustomersClient customers={mockCustomers} />)
    const input = screen.getByTestId('search-input') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'Jane' } })
    expect(screen.getByText('1 customers')).toBeInTheDocument()
  })

  it('returns no results for non-matching search', () => {
    render(<CustomersClient customers={mockCustomers} />)
    const input = screen.getByTestId('search-input') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'nonexistent' } })
    expect(screen.getByText('0 customers')).toBeInTheDocument()
  })
})
