import { useTheme } from 'next-themes'

export function useToggleTheme() {
  const { theme, themes, setTheme } = useTheme()
  const currentTheme = theme ?? 'light'

  return { theme: currentTheme, setTheme, themes }
}
