"use client";

import { Button, Input, Spinner, addToast } from "@heroui/react";
import { Trans, useLingui } from "@lingui/react/macro";
import { PhoneIcon, SaveIcon } from "lucide-react";
import { useState } from "react";
import { updatePhoneNumber } from "~/applications/Profile/Api/updatePhoneNumber";

interface SettingsPhoneNumberProps {
  defaultValue: string;
}

export const SettingsPhoneNumber = ({ defaultValue }: SettingsPhoneNumberProps) => {
  const { t } = useLingui();
  const [phoneNumber, setPhoneNumber] = useState<string>(defaultValue);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const hasChanged = phoneNumber !== defaultValue;

  const handleSave = async () => {
    if (!hasChanged) return;

    try {
      setIsLoading(true);
      await updatePhoneNumber({ phone: phoneNumber });
      addToast({
        title: <Trans>Success</Trans>,
        description: <Trans>Phone number updated</Trans>,
        color: "success"
      });
    } catch (error) {
      addToast({
        title: <Trans>Error</Trans>,
        description: <Trans>Failed to update phone number</Trans>,
        color: "danger"
      });
      setPhoneNumber(defaultValue);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <Input
          label={t`Phone number`}
          placeholder={"+33 6 12 34 56 78"}
          value={phoneNumber}
          onValueChange={setPhoneNumber}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          startContent={
            <PhoneIcon
              className={`h-4 w-4 ${isFocused ? "text-primary" : "text-gray-400"} transition-colors`}
            />
          }
          variant="bordered"
          size="sm"
          classNames={{
            inputWrapper: "border-gray-300 hover:border-primary-400 focus-within:border-primary-500"
          }}
          isDisabled={isLoading}
        />

        <p className="text-xs text-gray-500">
          <Trans>Your phone number will be used for account recovery and notifications.</Trans>
        </p>
      </div>

      <div className="flex gap-2">
        <Button
          color="primary"
          size="sm"
          onPress={handleSave}
          isDisabled={!hasChanged || isLoading}
          startContent={isLoading ? <Spinner size="sm" color="white" /> : <SaveIcon className="h-4 w-4" />}
        >
          <Trans>Save changes</Trans>
        </Button>
        {hasChanged && (
          <Button
            color="default"
            variant="light"
            size="sm"
            onPress={() => setPhoneNumber(defaultValue)}
            isDisabled={isLoading}
          >
            <Trans>Cancel</Trans>
          </Button>
        )}
      </div>

      {phoneNumber && !phoneNumber.match(/^\+?[\d\s-()]+$/) && (
        <p className="text-xs text-warning-600">
          <Trans>Please enter a valid phone number format.</Trans>
        </p>
      )}
    </div>
  );
};
