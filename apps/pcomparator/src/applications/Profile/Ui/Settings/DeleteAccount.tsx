"use client";

import { Button, Card, CardBody, CardFooter, addToast, useDisclosure } from "@heroui/react";
import { Trans, useLingui } from "@lingui/react/macro";
import { AlertTriangleIcon, TrashIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteAccount } from "~/applications/Profile/Api/deleteAccount";
import { DeleteAccountModal } from "./DeleteAccountModal";

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
      <CardBody className="space-y-4">
        <Card shadow="sm">
          <CardBody className="flex flex-row gap-3">
            <AlertTriangleIcon className="text-danger-500" />
            <div className="flex-1 text-sm text-danger-500 mt-1">
              <p className="font-semibold mb-1">
                <Trans>Warning: This action cannot be undone</Trans>
              </p>
              <p>
                <Trans>
                  Permanently remove your Personal Account and all of its contents from the Deazl platform.
                  This action is not reversible, so please continue with caution.
                </Trans>
              </p>
            </div>
          </CardBody>
        </Card>
      </CardBody>
      <CardFooter>
        <Button
          color="danger"
          variant="flat"
          size="lg"
          onPress={onOpen}
          startContent={<TrashIcon className="h-4 w-4" />}
          className="w-full sm:w-auto"
        >
          <Trans>Delete Personal Account</Trans>
        </Button>
      </CardFooter>

      <DeleteAccountModal
        isOpen={isOpen}
        onClose={onClose}
        confirmText={confirmText}
        setConfirmText={setConfirmText}
        isLoading={isLoading}
        handleDelete={handleDelete}
        expectedText={expectedText}
        isConfirmed={isConfirmed}
      />
    </>
  );
};
