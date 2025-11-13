"use client";

import { Button, Link } from "@heroui/react";
import { ArrowLeftIcon } from "lucide-react";

export const SettingsHeader = () => {
  return (
    <div className="flex flex-col sticky top-0 z-20 gap-3 mb-4 sm:mb-6 p-4 border-b border-gray-200 backdrop-blur-sm dark:bg-gray-900/70">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Button variant="light" size="sm" isIconOnly className="flex-shrink-0" as={Link} href="/">
            <ArrowLeftIcon className="h-4 w-4" />
          </Button>
          <div className="flex flex-col min-w-0 flex-1">
            <h1 className="text-base sm:text-lg font-semibold truncate">Account Settings</h1>
          </div>
        </div>
      </div>
    </div>
  );
};
