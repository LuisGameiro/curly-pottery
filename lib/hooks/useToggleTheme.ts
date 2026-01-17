import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export const useToggleTheme = () => {
  const { theme, themes, setTheme } = useTheme();
  const [themeValue, setThemeValue] = useState<string>(theme ?? "system");

  useEffect(() => {
    setThemeValue((current) => {
      const next = theme ?? 'system';
      return current === next ? current : next;
    });
  }, [theme]);

  return { theme: themeValue, setTheme, themes };
};
