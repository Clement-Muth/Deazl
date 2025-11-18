"use client";

import { Card, CardHeader, Divider } from "@heroui/react";
import { Trans } from "@lingui/react/macro";
import { SettingsDeleteAccount } from "~/applications/Profile/Ui/Settings/DeleteAccount";

export const DangerZoneSection = () => {
  return (
    <Card className="bg-contain overflow-hidden">
      <CardHeader className="flex flex-col items-start bg-danger/20">
        <h2 className="text-base md:text-lg font-semibold text-danger-500">
          <Trans>Danger Zone</Trans>
        </h2>
        <p className="text-xs md:text-sm text-danger-500 mt-1">
          <Trans>Irreversible and destructive actions</Trans>
        </p>
      </CardHeader>
      <Divider />
      <SettingsDeleteAccount />
    </Card>
  );
};
