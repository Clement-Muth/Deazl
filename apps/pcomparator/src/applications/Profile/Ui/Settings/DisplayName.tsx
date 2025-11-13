"use client";

import { Button, Input, Spinner, addToast } from "@heroui/react";
import { Trans, useLingui } from "@lingui/react/macro";
import { SaveIcon, UserIcon } from "lucide-react";
import { useState } from "react";
import { updateFullname } from "~/applications/Profile/Api/updateFullname";

interface SettingsDisplayNameProps {
  defaultValue: string;
}

export const SettingsDisplayName = ({ defaultValue }: SettingsDisplayNameProps) => {
  const { t } = useLingui();
  const [displayName, setDisplayName] = useState<string>(defaultValue);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const hasChanged = displayName !== defaultValue;
  const isValid = displayName.trim().length > 0 && displayName.length <= 32;

  const handleSave = async () => {
    if (!hasChanged || !isValid) return;

    try {
      setIsLoading(true);
      await updateFullname({ name: displayName });
      addToast({
        title: <Trans>Success</Trans>,
        description: <Trans>Display name updated</Trans>,
        color: "success"
      });
    } catch (error) {
      addToast({
        title: <Trans>Error</Trans>,
        description: <Trans>Failed to update display name</Trans>,
        color: "danger"
      });
      setDisplayName(defaultValue);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <Input
          label={t`Display name`}
          placeholder={t`Enter your display name`}
          value={displayName}
          onValueChange={setDisplayName}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          startContent={
            <UserIcon
              className={`h-4 w-4 ${isFocused ? "text-primary" : "text-gray-400"} transition-colors`}
            />
          }
          variant="bordered"
          size="sm"
          classNames={{
            inputWrapper: "border-gray-300 hover:border-primary-400 focus-within:border-primary-500"
          }}
          isDisabled={isLoading}
          errorMessage={
            displayName.trim().length === 0
              ? t`Display name is required`
              : displayName.length > 32
                ? t`Display name must be 32 characters or less`
                : undefined
          }
          isInvalid={displayName.trim().length > 0 && !isValid}
        />

        <p className="text-xs text-gray-500">
          <Trans>This is the name that will be displayed across the application.</Trans>
        </p>
      </div>

      <div className="flex gap-2">
        <Button
          color="primary"
          size="sm"
          onPress={handleSave}
          isDisabled={!hasChanged || !isValid || isLoading}
          startContent={isLoading ? <Spinner size="sm" color="white" /> : <SaveIcon className="h-4 w-4" />}
        >
          <Trans>Save changes</Trans>
        </Button>
        {hasChanged && (
          <Button
            color="default"
            variant="light"
            size="sm"
            onPress={() => setDisplayName(defaultValue)}
            isDisabled={isLoading}
          >
            <Trans>Cancel</Trans>
          </Button>
        )}
      </div>
    </div>
  );
};
