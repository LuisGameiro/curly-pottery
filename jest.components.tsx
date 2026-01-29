jest.mock('@components/ui', () => ({
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
  Container: ({
    children,
    variant,
    className,
  }: {
    children: React.ReactNode
    variant?: string
    className?: string
  }) => (
    <div data-testid={`container-${variant}`} className={className}>
      {children}
    </div>
  ),
  Text: ({
    children,
    variant,
    role,
  }: {
    children: React.ReactNode
    variant?: string
    role?: string
  }) => (
    <div data-testid={`text-${variant}`} role={role}>
      {children}
    </div>
  ),
  Input: ({
    label,
    error,
    ...props
  }: {
    label: string
    error?: string
  } & React.InputHTMLAttributes<HTMLInputElement>) => (
    <div>
      <label>{label}</label>
      <input data-testid={label} {...props} />
      {error && <span>{error}</span>}
    </div>
  ),

  InputTextArea: ({
    label,
    error,
    ...props
  }: {
    label: string
    error?: string
  } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
    <div>
      <label>{label}</label>
      <textarea data-testid={label} {...props} />
      {error && <span>{error}</span>}
    </div>
  ),

  InputImage: ({ error }: { error?: string }) => (
    <div data-testid="input-image">{error && <span>{error}</span>}</div>
  ),

  InputCheckbox: ({
    label,
    ...props
  }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) => (
    <div>
      <label>{label}</label>
      <input type="checkbox" data-testid={label} {...props} />
    </div>
  ),
  InputSelect: () => {
    const mockSelect = ({ options }: { options?: string[] }) => (
      <select>
        {options?.map((o: string) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    )
    mockSelect.displayName = 'InputSelect'
    return mockSelect
  },
  LoadingDots: () => <div>Loading...</div>,
}))
