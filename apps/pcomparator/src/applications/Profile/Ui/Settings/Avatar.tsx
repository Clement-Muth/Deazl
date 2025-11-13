"use client";

import { Avatar, Button, Spinner, addToast } from "@heroui/react";
import { Trans } from "@lingui/react/macro";
import { CameraIcon, UploadIcon } from "lucide-react";
import { useRef, useState } from "react";
import { updateAvatar } from "~/applications/Profile/Api/updateAvatar";

interface SettingsAvatarProps {
  defaultValue: string;
}

export const SettingsAvatar = ({ defaultValue }: SettingsAvatarProps) => {
  const [avatar, setAvatar] = useState<string>(defaultValue);
  const [isLoading, setIsLoading] = useState(false);
  const inputFileRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = async () => {
    if (!inputFileRef.current?.files) return;

    const file = inputFileRef.current.files[0];
    if (!file) return;

    try {
      setIsLoading(true);
      const result = await updateAvatar({ image: file });
      setAvatar(result.image);
      addToast({
        title: <Trans>Success</Trans>,
        description: <Trans>Avatar updated</Trans>,
        color: "success"
      });
    } catch (error) {
      addToast({
        title: <Trans>Error</Trans>,
        description: <Trans>Failed to update avatar</Trans>,
        color: "danger"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
        {/* Avatar with loading overlay */}
        <div className="relative">
          <label htmlFor="avatar" className="cursor-pointer group">
            <Avatar
              src={avatar}
              className="w-24 h-24 md:w-28 md:h-28 text-large transition-all group-hover:scale-105"
              alt="avatar"
              color="primary"
              isBordered
            />
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                <Spinner size="lg" color="white" />
              </div>
            )}
            {!isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 rounded-full transition-all">
                <CameraIcon className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            )}
          </label>
          <input
            type="file"
            id="avatar"
            name="avatar"
            accept=".png,.jpg,.jpeg,.webp"
            ref={inputFileRef}
            onChange={handleAvatarChange}
            hidden
          />
        </div>

        {/* Info and Upload Button */}
        <div className="flex-1 text-center sm:text-left">
          <h4 className="text-base md:text-lg font-semibold text-gray-900 mb-1">
            <Trans>Profile Picture</Trans>
          </h4>
          <p className="text-xs md:text-sm text-gray-600 mb-3">
            <Trans>Click on the avatar to upload a custom one from your files.</Trans>
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              size="sm"
              color="primary"
              variant="flat"
              startContent={<UploadIcon className="h-4 w-4" />}
              onPress={() => inputFileRef.current?.click()}
              isDisabled={isLoading}
            >
              <Trans>Upload new</Trans>
            </Button>
            {avatar !== defaultValue && (
              <Button
                size="sm"
                color="default"
                variant="light"
                onPress={() => setAvatar(defaultValue)}
                isDisabled={isLoading}
              >
                <Trans>Reset</Trans>
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-200">
        <Trans>Recommended: Square image, at least 200x200px. Max size: 5MB. Formats: PNG, JPG, WEBP</Trans>
      </div>
    </div>
  );
};
