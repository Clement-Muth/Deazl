import { useLayoutEffect, useState } from "react";

export const useTheme = () => {
  const getCurrentTheme = () =>
    window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  const [activeTheme, setActiveTheme] = useState<string>(getCurrentTheme());
  const mqListener = (e: any) => {
    setActiveTheme(e.matches ? "dark" : "light");
  };

  useLayoutEffect(() => {
    const darkThemeMq = window.matchMedia("(prefers-color-scheme: dark)");

    darkThemeMq.addEventListener("change", mqListener);

    return () => darkThemeMq.removeEventListener("change", mqListener);
  }, []);

  return { activeTheme };
};
