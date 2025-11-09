"use client";

import { Button } from "@heroui/react";
import { Trans } from "@lingui/react/macro";
import { BookOpen, LineChart, type LucideIcon, Plus, ReceiptText, Settings } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  path: string;
  label: React.ReactNode;
  icon: LucideIcon;
  exact?: boolean;
}

const navigationItems: NavItem[] = [
  {
    path: "/dashboard/my-prices",
    label: <Trans>Price</Trans>,
    icon: LineChart
  },
  {
    path: "/shopping-lists",
    label: <Trans>Shopping Lists</Trans>,
    icon: ReceiptText
  },
  {
    path: "/recipes",
    label: <Trans>Recipes</Trans>,
    icon: BookOpen
  }
];

const bottomItems: NavItem[] = [
  {
    path: "/settings",
    label: <Trans>Settings</Trans>,
    icon: Settings
  }
];

export const DesktopNav = () => {
  const pathname = usePathname();

  const isActive = (itemPath: string, exact = false) => {
    if (exact) return pathname === itemPath;
    return pathname.startsWith(itemPath);
  };

  const renderNavItem = ({ path, label, icon: Icon, exact }: NavItem) => {
    const active = isActive(path, exact);

    return (
      <Button
        key={path}
        as={Link}
        href={path}
        variant="light"
        className={`justify-start h-9 w-full transition-all duration-200 group ${
          active
            ? "bg-primary-50 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 font-medium"
            : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
        }`}
        startContent={
          <Icon
            className={`w-4 h-4 ${
              active ? "text-primary-600 dark:text-primary-400" : "text-gray-600 dark:text-gray-400"
            }`}
          />
        }
      >
        <span className="text-sm">{label}</span>
        {active && (
          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary-600 dark:bg-primary-400" />
        )}
      </Button>
    );
  };

  return (
    <nav className="hidden md:flex fixed top-0 left-0 h-[100dvh] flex-col gap-2 w-56 py-4 border-r border-gray-200/50 dark:border-gray-800/50 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80">
      <Link href="/" className="group flex items-center gap-2.5 px-4 py-2 mb-4">
        <div className="relative h-7 w-7">
          <Image
            src="/static/deazl-logo-v2.svg"
            alt="Deazl"
            width={28}
            height={28}
            className="transition-all duration-200 group-hover:scale-110 group-hover:rotate-[-8deg]"
          />
        </div>
        <p className="font-bold text-sm tracking-tight bg-gradient-to-r from-gray-900 via-primary-600 to-gray-900 dark:from-white dark:via-primary-400 dark:to-white bg-clip-text text-transparent">
          deazl
        </p>
      </Link>

      <Button
        as={Link}
        href="/quick-add"
        className="mx-4 mb-4 justify-start bg-primary-50 hover:bg-primary-100 dark:bg-primary-900/50 dark:hover:bg-primary-800/50"
        color="primary"
        startContent={<Plus className="w-4 h-4" />}
        size="sm"
      >
        <Trans>Add a Price</Trans>
      </Button>

      {/* Main Navigation */}
      <div className="flex-1 px-4">
        <div className="flex flex-col space-y-0.5">{navigationItems.map(renderNavItem)}</div>
      </div>

      {/* Bottom Items */}
      <div className="px-4 pt-4 border-t border-gray-200/50 dark:border-gray-800/50">
        <div className="flex flex-col space-y-0.5">{bottomItems.map(renderNavItem)}</div>
      </div>
    </nav>
  );
};
