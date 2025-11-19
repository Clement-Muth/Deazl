"use client";

import { Trans } from "@lingui/react/macro";
import { SettingsTheme } from "~/applications/Profile/Ui/Settings/Theme";
import { SettingCard } from "./SettingCard";

export const AppearanceSection = () => {
  return (
    <SettingCard title={<Trans>Appearance</Trans>} subTitle={<Trans>Customize the look and feel</Trans>}>
      <SettingsTheme />
    </SettingCard>
  );
};
