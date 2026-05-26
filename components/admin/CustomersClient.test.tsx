import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import CustomersClient from './CustomersClient'
import { UserWithOrders } from '@lib/types/types'
import { PaginatedResult } from '@lib/pagination'

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
  return function MockCustomerTable({
    customers,
  }: {
    customers: UserWithOrders[]
  }) {
    return <div data-testid="customer-table">{customers.length} customers</div>
  }
})

jest.mock('@actions/customer.actions', () => ({
  getAllCustomers: jest.fn(),
}))

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

  const createInitialData = (
    items: UserWithOrders[],
  ): PaginatedResult<UserWithOrders> => ({
    items,
    nextCursor: null,
    hasMore: false,
    total: items.length,
  })

  it('renders customers heading', () => {
    render(
      <CustomersClient
        initialData={createInitialData(mockCustomers)}
        initialSearch=""
      />,
    )
    expect(screen.getByText('Customers')).toBeInTheDocument()
  })

  it('renders search input with correct placeholder', () => {
    render(
      <CustomersClient
        initialData={createInitialData(mockCustomers)}
        initialSearch=""
      />,
    )
    expect(
      screen.getByPlaceholderText('Search by name or email...'),
    ).toBeInTheDocument()
  })

  it('renders all customers initially', () => {
    render(
      <CustomersClient
        initialData={createInitialData(mockCustomers)}
        initialSearch=""
      />,
    )
    expect(screen.getByText('3 customers')).toBeInTheDocument()
  })

  it('shows total count in subtitle', () => {
    render(
      <CustomersClient
        initialData={createInitialData(mockCustomers)}
        initialSearch=""
      />,
    )
    expect(screen.getByText(/Showing 3 of 3 customers/)).toBeInTheDocument()
  })
})
