"use client";

import { Trans } from "@lingui/react/macro";
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
  return (
    <div className="flex flex-col">
      <PageHeader title={<Trans>Settings</Trans>} />
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
