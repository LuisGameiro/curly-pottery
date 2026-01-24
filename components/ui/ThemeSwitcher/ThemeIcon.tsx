import { Computer, Moon, Sun } from 'lucide-react'

interface ThemeIconProps {
  theme?: string
  width: number
  height: number
}

const ThemeIcon = ({ theme, ...props }: ThemeIconProps) => {
  switch (theme) {
    case 'light':
      return <Sun {...props} color="blue" />

    case 'dark':
      return <Moon {...props} color="blue" />

    default:
      return <Computer {...props} color="blue" />
  }
}

export default ThemeIcon
