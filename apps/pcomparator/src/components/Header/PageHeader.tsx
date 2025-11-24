"use client";

import { Button, Link } from "@heroui/react";
import { ArrowLeftIcon } from "lucide-react";

interface PageHeaderProps {
  title: string | React.ReactNode;
  href?: string;
  extra?: React.ReactNode;
  children?: React.ReactNode;
}

export const PageHeader = ({ title, href, extra, children }: PageHeaderProps) => {
  return (
    <header className="flex flex-col sticky top-0 z-20 gap-3 mb-4 sm:mb-6 p-4 border-b border-content3 backdrop-blur-lg w-full">
      <div className="flex items-center justify-between gap-2">
        <Button
          variant="light"
          className="flex-shrink-0"
          as={Link}
          href={href ?? "/"}
          startContent={<ArrowLeftIcon className="h-4 w-4" />}
        >
          <div className="flex flex-col">
            <h1 className="text-lg font-semibold truncate">{title}</h1>
          </div>
        </Button>
        {extra && <div className="flex-shrink-0">{extra}</div>}
      </div>
      {children}
    </header>
  );
};
