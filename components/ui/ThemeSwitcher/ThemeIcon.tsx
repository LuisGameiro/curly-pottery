import { Computer, Moon, Sun } from 'lucide-react'

interface ThemeIconProps {
  theme?: string
  width: number
  height: number
}

const ThemeIcon = ({ theme, ...props }: ThemeIconProps) => {
  switch (theme) {
    case 'light':
      return <Sun {...props} />

    case 'dark':
      return <Moon {...props} />

    default:
      return <Computer {...props} />
  }
}

export default ThemeIcon
