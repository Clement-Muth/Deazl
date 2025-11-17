"use client";

import { Button, Listbox, ListboxItem, Popover, PopoverContent, PopoverTrigger } from "@heroui/react";
import { Trans } from "@lingui/react/macro";
import { Moon, Settings, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { type Dispatch, type SetStateAction, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

export const ThemeSwitcher = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme() as { theme: Theme; setTheme: Dispatch<SetStateAction<Theme>> };

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div>
      <Popover placement="bottom" radius="sm">
        <PopoverTrigger>
          <Button
            startContent={theme === "light" ? <Sun /> : theme === "dark" ? <Moon /> : <Settings />}
            variant="light"
            radius="full"
            isIconOnly
          />
        </PopoverTrigger>
        <PopoverContent className="px-1 min-w-44">
          <Listbox>
            <ListboxItem startContent={<Sun />} key="light" onPress={() => setTheme("light")}>
              <Trans>Light</Trans>
            </ListboxItem>
            <ListboxItem startContent={<Moon />} key="dark" onPress={() => setTheme("dark")}>
              <Trans>Dark</Trans>
            </ListboxItem>
            <ListboxItem startContent={<Settings />} key="system" onPress={() => setTheme("system")}>
              <Trans>System</Trans>
            </ListboxItem>
          </Listbox>
        </PopoverContent>
      </Popover>
    </div>
  );
};
