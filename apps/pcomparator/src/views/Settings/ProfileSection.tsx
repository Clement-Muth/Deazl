"use client";

import { Trans } from "@lingui/react/macro";
import { SettingsAvatar } from "~/applications/Profile/Ui/Settings/Avatar";
import { SettingsDisplayName } from "~/applications/Profile/Ui/Settings/DisplayName";

interface ProfileSectionProps {
  userImage?: string;
  userName?: string;
}

export const ProfileSection = ({ userImage, userName }: ProfileSectionProps) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 md:px-6 md:py-4 border-b border-gray-200 bg-linear-to-r from-primary-50 to-primary-100">
        <h2 className="text-base md:text-lg font-semibold text-gray-900">
          <Trans>Profile Information</Trans>
        </h2>
        <p className="text-xs md:text-sm text-gray-600 mt-1">
          <Trans>Update your profile information and avatar</Trans>
        </p>
      </div>
      <div className="p-4 md:p-6 space-y-4 md:space-y-6">
        <SettingsAvatar defaultValue={userImage!} />
        <SettingsDisplayName defaultValue={userName!} />
      </div>
    </div>
  );
};
