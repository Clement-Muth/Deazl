"use client";

import { Button, useDisclosure } from "@heroui/react";
import { ChefHat, Home, ReceiptText, User } from "lucide-react";
import type { ReactNode } from "react";
import { SignInModal } from "~/applications/Authentication/Ui/Signin/SignInModal/SignInModal";
import Link from "~/components/Link/Link";

export interface TabbarProps {
  mainButton: ReactNode;
  isSignedIn: boolean;
}

export const Tabbar = ({ mainButton, isSignedIn }: TabbarProps) => {
  const { isOpen, onClose, onOpen } = useDisclosure();

  return (
    <div className="flex sticky bottom-0 justify-evenly py-4 rounded-t-3xl items-center shadow-large bg-content1 z-30">
      <Button as={Link} href="/" startContent={<Home />} variant="light" size="lg" radius="full" isIconOnly />
      <Button
        as={Link}
        href="/recipes"
        startContent={<ChefHat />}
        variant="light"
        size="lg"
        radius="full"
        isIconOnly
      />
      {mainButton}
      <Button
        as={Link}
        href="/shopping-lists"
        startContent={<ReceiptText />}
        variant="light"
        size="lg"
        radius="full"
        isIconOnly
      />
      <Button
        as={isSignedIn ? Link : Button}
        href={isSignedIn ? "/settings" : undefined}
        onPress={isSignedIn ? undefined : onOpen}
        startContent={<User />}
        variant="light"
        size="lg"
        radius="full"
        isIconOnly
      />
      <SignInModal isOpen={isOpen} onClose={onClose} />
    </div>
  );
};
