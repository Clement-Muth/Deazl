"use client";

import { Card, CardBody, Radio, RadioGroup } from "@heroui/react";
import { Trans } from "@lingui/react/macro";
import { Laptop, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function SettingsTheme() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Card>
        <CardBody className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-default-100 flex items-center justify-center">
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">
                <Trans>Theme</Trans>
              </h3>
              <p className="text-xs text-default-500">
                <Trans>Loading...</Trans>
              </p>
            </div>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardBody className="space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-default-100 flex items-center justify-center">
            {theme === "dark" ? (
              <Moon className="w-5 h-5" />
            ) : theme === "system" ? (
              <Laptop className="w-5 h-5" />
            ) : (
              <Sun className="w-5 h-5" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-sm">
              <Trans>Appearance</Trans>
            </h3>
            <p className="text-xs text-default-500">
              <Trans>Choose your preferred theme</Trans>
            </p>
          </div>
        </div>

        <RadioGroup value={theme} onValueChange={setTheme}>
          <Radio
            value="light"
            description={<Trans>Always use light theme</Trans>}
            classNames={{
              base: "max-w-full m-0 gap-2",
              label: "text-sm"
            }}
          >
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4" />
              <Trans>Light</Trans>
            </div>
          </Radio>
          <Radio
            value="dark"
            description={<Trans>Always use dark theme</Trans>}
            classNames={{
              base: "max-w-full m-0 gap-2",
              label: "text-sm"
            }}
          >
            <div className="flex items-center gap-2">
              <Moon className="w-4 h-4" />
              <Trans>Dark</Trans>
            </div>
          </Radio>
          <Radio
            value="system"
            description={<Trans>Follow your device theme settings</Trans>}
            classNames={{
              base: "max-w-full m-0 gap-2",
              label: "text-sm"
            }}
          >
            <div className="flex items-center gap-2">
              <Laptop className="w-4 h-4" />
              <Trans>System</Trans>
            </div>
          </Radio>
        </RadioGroup>
      </CardBody>
    </Card>
  );
}
