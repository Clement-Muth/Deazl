"use client";

import { Avatar, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@heroui/react";
import { Trans } from "@lingui/react/macro";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";

export const ProfileButton = () => {
  const session = useSession();

  return (
    <Dropdown placement="bottom-end">
      <DropdownTrigger>
        <Avatar
          as="button"
          className="transition-transform"
          color="primary"
          name={session.data?.user!.name!}
          size="sm"
          src={session.data?.user!.image!}
          isBordered
        />
      </DropdownTrigger>
      <DropdownMenu aria-label="Profile Actions" variant="flat">
        <DropdownItem key="dashboard" textValue="dashboard" className="p-0">
          <Link
            href="/dashboard"
            className="px-2 py-1.5 w-full block bg-transparent hover:bg-default/40 hover:text-default-foreground hover:transition-colors rounded-small"
          >
            <Trans>Dashboard</Trans>
          </Link>
        </DropdownItem>
        <DropdownItem key="settings" textValue="settings" className="p-0">
          <Link
            href="/settings"
            className="px-2 py-1.5 w-full block bg-transparent hover:bg-default/40 hover:text-default-foreground hover:transition-colors rounded-small"
          >
            <Trans>Settings</Trans>
          </Link>
        </DropdownItem>
        <DropdownItem key="logout" color="danger" onPress={() => signOut()} textValue="signout">
          <Trans>Signout</Trans>
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};
