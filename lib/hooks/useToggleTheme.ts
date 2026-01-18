import { useTheme } from "next-themes";
import { useLayoutEffect, useState } from "react";

export const useToggleTheme = () => {
  const { theme, themes, setTheme } = useTheme();
  // const [themeValue, setThemeValue] = useState<string>(theme ?? "light");

  // useLayoutEffect(() => {
  //   setThemeValue((current) => {
  //     const next = theme ?? 'light';
  //     return current === next ? current : next;
  //   });
  // }, [theme]);

  const currentTheme = theme ?? "light";
  return { theme: currentTheme, setTheme, themes };
};
