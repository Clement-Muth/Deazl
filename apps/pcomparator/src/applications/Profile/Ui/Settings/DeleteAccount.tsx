"use client";

import { Button, Input, Spinner, addToast, useDisclosure } from "@heroui/react";
import { Trans, useLingui } from "@lingui/react/macro";
import { AlertTriangleIcon, TrashIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteAccount } from "~/applications/Profile/Api/deleteAccount";
import { Modal } from "~/components/Modal/Modal";

export const SettingsDeleteAccount = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { t } = useLingui();
  const { replace } = useRouter();
  const [confirmText, setConfirmText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const expectedText = "delete my account";
  const isConfirmed = confirmText.toLowerCase() === expectedText;

  const handleDelete = async () => {
    if (!isConfirmed) return;

    try {
      setIsLoading(true);
      await deleteAccount();
      addToast({
        title: <Trans>Account deleted</Trans>,
        description: <Trans>Your account has been permanently deleted</Trans>,
        color: "success"
      });
      replace("/");
    } catch (error) {
      addToast({
        title: <Trans>Error</Trans>,
        description: <Trans>Failed to delete account. Please try again.</Trans>,
        color: "danger"
      });
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertTriangleIcon className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 text-xs md:text-sm text-red-800">
            <p className="font-semibold mb-1">
              <Trans>Warning: This action cannot be undone</Trans>
            </p>
            <p>
              <Trans>
                Permanently remove your Personal Account and all of its contents from the Deazl platform. This
                action is not reversible, so please continue with caution.
              </Trans>
            </p>
          </div>
        </div>

        <Button
          color="danger"
          variant="flat"
          size="sm"
          onPress={onOpen}
          startContent={<TrashIcon className="h-4 w-4" />}
          className="w-full sm:w-auto"
        >
          <Trans>Delete Personal Account</Trans>
        </Button>
      </div>

      <Modal
        isOpen={isOpen}
        onClose={onClose}
        header={
          <div className="flex items-center gap-2">
            <AlertTriangleIcon className="h-5 w-5 text-danger" />
            <span>
              <Trans>Delete Personal Account</Trans>
            </span>
          </div>
        }
        body={
          <div className="space-y-4">
            <div className="p-4 bg-danger-50 border border-danger-200 rounded-lg">
              <p className="text-sm text-danger-800 font-medium">
                <Trans>This action will permanently delete your account and all associated data.</Trans>
              </p>
            </div>

            <div className="space-y-2">
              <Input
                label={
                  <span className="text-sm">
                    <Trans>
                      To verify, type <strong className="font-mono text-danger">{expectedText}</strong> below:
                    </Trans>
                  </span>
                }
                placeholder={expectedText}
                value={confirmText}
                onValueChange={setConfirmText}
                variant="bordered"
                size="sm"
                autoComplete="off"
                classNames={{
                  inputWrapper: "border-danger-300"
                }}
                isDisabled={isLoading}
              />
              {confirmText && !isConfirmed && (
                <p className="text-xs text-danger-600">
                  <Trans>Text doesn't match. Please type exactly: {expectedText}</Trans>
                </p>
              )}
            </div>
          </div>
        }
        footer={
          <div className="flex gap-2 justify-end w-full">
            <Button color="default" variant="light" size="sm" onPress={onClose} isDisabled={isLoading}>
              <Trans>Cancel</Trans>
            </Button>
            <Button
              color="danger"
              size="sm"
              onPress={handleDelete}
              isDisabled={!isConfirmed || isLoading}
              startContent={
                isLoading ? <Spinner size="sm" color="white" /> : <TrashIcon className="h-4 w-4" />
              }
            >
              <Trans>I understand, delete my account</Trans>
            </Button>
          </div>
        }
        modalProps={{
          size: "lg"
        }}
      />
    </>
  );
};
