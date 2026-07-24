import { render, screen, fireEvent, waitFor } from '@testing-library/react'
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
  Button: ({
    children,
    onClick,
    disabled,
  }: {
    children: React.ReactNode
    onClick?: () => void
    disabled?: boolean
  }) => (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
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

  it('shows next page button when hasMore is true', async () => {
    const { getAllCustomers: mockNextAllCustomers } = jest.requireMock(
      '@actions/customer.actions',
    )
    mockNextAllCustomers.mockResolvedValue({
      success: true,
      message: '',
      data: {
        items: [createMockUser({ id: '1', firstName: 'John' })],
        nextCursor: 'cursor-abc',
        hasMore: true,
        total: 1,
      },
    })

    const initialData = createInitialData(mockCustomers)
    initialData.hasMore = true
    initialData.nextCursor = 'cursor-abc'

    render(<CustomersClient initialData={initialData} initialSearch="" />)

    const nextButton = screen.getByText('Next page')
    expect(nextButton).toBeInTheDocument()

    fireEvent.click(nextButton)

    await waitFor(() => {
      expect(mockNextAllCustomers).toHaveBeenCalledWith({
        search: '',
        cursor: 'cursor-abc',
        take: 50,
      })
    })
  })

  it('triggers debounced search on input change', () => {
    const { getAllCustomers: mockSearchCustomers } = jest.requireMock(
      '@actions/customer.actions',
    )

    jest.useFakeTimers()

    render(
      <CustomersClient
        initialData={createInitialData(mockCustomers)}
        initialSearch=""
      />,
    )

    const searchInput = screen.getByTestId('search-input')
    fireEvent.change(searchInput, { target: { value: 'john' } })
    jest.advanceTimersByTime(300)

    expect(mockSearchCustomers).toHaveBeenCalledWith(
      expect.objectContaining({ search: 'john' }),
    )

    jest.useRealTimers()
  })

  it('updates displayed count after search results load', async () => {
    const { getAllCustomers: mockGetAllCustomers } = jest.requireMock(
      '@actions/customer.actions',
    )

    jest.useFakeTimers()

    mockGetAllCustomers.mockResolvedValue({
      success: true,
      message: '',
      data: {
        items: [createMockUser({ id: '1', firstName: 'John' })],
        nextCursor: null,
        hasMore: false,
        total: 1,
      },
    })

    render(
      <CustomersClient
        initialData={createInitialData(mockCustomers)}
        initialSearch=""
      />,
    )

    const searchInput = screen.getByTestId('search-input')
    fireEvent.change(searchInput, { target: { value: 'john' } })
    jest.advanceTimersByTime(300)

    await waitFor(() => {
      expect(screen.getByText(/Showing 1 of 1 customers/)).toBeInTheDocument()
    })

    jest.useRealTimers()
  })

  it('updates display when initialData prop changes', () => {
    const { rerender } = render(
      <CustomersClient
        initialData={createInitialData(mockCustomers)}
        initialSearch=""
      />,
    )

    const newCustomers = [createMockUser({ id: '4', firstName: 'New' })]
    rerender(
      <CustomersClient
        initialData={createInitialData(newCustomers)}
        initialSearch=""
      />,
    )

    expect(screen.getByText(/Showing 1 of 1 customers/)).toBeInTheDocument()
  })

  it('shows empty subtitle when there are no customers', () => {
    render(
      <CustomersClient initialData={createInitialData([])} initialSearch="" />,
    )
    expect(
      screen.getByText('View and manage your customer relationships.'),
    ).toBeInTheDocument()
  })
})
