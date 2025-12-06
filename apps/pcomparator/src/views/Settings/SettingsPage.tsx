"use client";

import { Button } from "@heroui/react";
import { Trans } from "@lingui/react/macro";
import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { PageHeader } from "~/components/Header/PageHeader";
import { AppearanceSection } from "./AppearanceSection";
import { ContactSection } from "./ContactSection";
import { DangerZoneSection } from "./DangerZoneSection";
import { ProfileSection } from "./ProfileSection";
import { ShoppingOptimizationSection } from "./ShoppingOptimizationSection";

interface SettingsPageProps {
  userImage?: string;
  userName?: string;
  phoneNumber?: string;
  userId: string;
}

export const SettingsPage = ({ userImage, userName, phoneNumber, userId }: SettingsPageProps) => {
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.replace("/");
  };

  return (
    <div className="flex flex-col">
      <PageHeader
        title={<Trans>Settings</Trans>}
        extra={
          <Button
            color="danger"
            variant="flat"
            size="sm"
            startContent={<LogOut className="w-4 h-4" />}
            onPress={handleSignOut}
            className="min-h-11 touch-manipulation"
          >
            <span className="hidden sm:inline">
              <Trans>Sign out</Trans>
            </span>
          </Button>
        }
      />
      <main className="container flex-col">
        <div className="max-w-4xl mx-auto px-4 pb-6">
          <div className="space-y-4 md:space-y-6">
            <ProfileSection userImage={userImage} userName={userName} />
            <AppearanceSection />
            <ContactSection phoneNumber={phoneNumber} />
            <ShoppingOptimizationSection userId={userId} />
            <DangerZoneSection />
          </div>
        </div>
      </main>
    </div>
  );
};
