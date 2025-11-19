"use client";

import { Trans } from "@lingui/react/macro";
import { SettingsPhoneNumber } from "~/applications/Profile/Ui/Settings/PhoneNumber";
import { SettingCard } from "./SettingCard";

interface ContactSectionProps {
  phoneNumber?: string;
}

export const ContactSection = ({ phoneNumber }: ContactSectionProps) => {
  return (
    <SettingCard
      title={<Trans>Contact Information</Trans>}
      subTitle={<Trans>Manage your contact details</Trans>}
    >
      <SettingsPhoneNumber defaultValue={phoneNumber ?? ""} />
    </SettingCard>
  );
};
