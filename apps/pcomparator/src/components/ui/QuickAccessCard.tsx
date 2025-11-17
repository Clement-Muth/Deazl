"use client";

import { Button } from "@heroui/react";
import Link from "next/link";
import type { ReactNode } from "react";

interface QuickAccessCardProps {
  icon: ReactNode;
  title: ReactNode;
  description: ReactNode;
  href?: string;
  onClick?: () => void;
}

export const QuickAccessCard = ({ icon, title, description, href, onClick }: QuickAccessCardProps) => {
  const content = (
    <>
      <div className="flex items-center justify-center mb-4">
        <div className="p-2 rounded-xl bg-primary-50 text-primary-500 dark:bg-primary-500/20">{icon}</div>
      </div>
      <div className="text-center space-y-1">
        <h3 className="font-medium text-lg group-hover:text-primary-500 transition-colors">{title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
      </div>
    </>
  );

  if (href) {
    return (
      <Button
        as={Link}
        href={href}
        variant="flat"
        className="h-auto py-6 bg-white hover:bg-gray-50 dark:bg-gray-800/50 dark:hover:bg-gray-800 group text-center flex flex-col items-center transition-all duration-200"
      >
        {content}
      </Button>
    );
  }

  return (
    <Button
      variant="flat"
      onPress={onClick}
      className="h-auto py-6 bg-white hover:bg-gray-50 dark:bg-gray-800/50 dark:hover:bg-gray-800 group text-center flex flex-col items-center transition-all duration-200"
    >
      {content}
    </Button>
  );
};
