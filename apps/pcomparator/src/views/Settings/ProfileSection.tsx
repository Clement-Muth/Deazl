"use client";

import {} from "@heroui/react";
import { Trans } from "@lingui/react/macro";
import { SettingsAvatar } from "~/applications/Profile/Ui/Settings/Avatar";
import { SettingsDisplayName } from "~/applications/Profile/Ui/Settings/DisplayName";
import { SettingCard } from "./SettingCard";

interface ProfileSectionProps {
  userImage?: string;
  userName?: string;
}

export const ProfileSection = ({ userImage, userName }: ProfileSectionProps) => {
  return (
    <SettingCard
      title={<Trans>Profile Information</Trans>}
      subTitle={<Trans>Update your profile information and avatar</Trans>}
    >
      <div className="space-y-4">
        <SettingsAvatar defaultValue={userImage!} />
        <SettingsDisplayName defaultValue={userName!} />
      </div>
    </SettingCard>
  );
};
