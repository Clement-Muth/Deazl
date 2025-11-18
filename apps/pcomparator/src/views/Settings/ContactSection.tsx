"use client";

import { Card, CardBody, CardHeader, Divider } from "@heroui/react";
import { Trans } from "@lingui/react/macro";
import { SettingsPhoneNumber } from "~/applications/Profile/Ui/Settings/PhoneNumber";

interface ContactSectionProps {
  phoneNumber?: string;
}

export const ContactSection = ({ phoneNumber }: ContactSectionProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-col items-start">
        <h2 className="text-base md:text-lg font-semibold text-foreground">
          <Trans>Contact Information</Trans>
        </h2>
        <p className="text-xs md:text-sm text-gray-400 mt-1">
          <Trans>Manage your contact details</Trans>
        </p>
      </CardHeader>
      <Divider />
      <CardBody>
        <SettingsPhoneNumber defaultValue={phoneNumber ?? ""} />
      </CardBody>
    </Card>
  );
};
