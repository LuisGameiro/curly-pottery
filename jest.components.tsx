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
  InputImage: ({
    label,
    onImagesChange,
    error,
    ...props
  }: {
    label?: string
    error?: string
    onImagesChange?: (data: { files: File[]; previews: string[] }) => void
  } & React.InputHTMLAttributes<HTMLInputElement>) => (
    <div>
      {label && <label>{label}</label>}
      <input
        data-testid="input-image"
        placeholder={label}
        type="file"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file && onImagesChange) {
            const preview = URL.createObjectURL(file)
            onImagesChange({
              files: [file],
              previews: [preview],
            })
          }
        }}
        {...props}
      />
      {error && <div className="error">{error}</div>}
    </div>
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
