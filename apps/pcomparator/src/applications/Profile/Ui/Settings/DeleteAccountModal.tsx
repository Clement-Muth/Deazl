import { Button, Input, Spinner } from "@heroui/react";
import { Trans } from "@lingui/react/macro";
import { AlertTriangleIcon, TrashIcon } from "lucide-react";
import { Modal } from "~/components/Modal/Modal";

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  confirmText: string;
  setConfirmText: (text: string) => void;
  isLoading: boolean;
  handleDelete: () => void;
  expectedText: string;
  isConfirmed: boolean;
}

export const DeleteAccountModal = ({
  confirmText,
  setConfirmText,
  isOpen,
  onClose,
  isLoading,
  handleDelete,
  expectedText,
  isConfirmed
}: DeleteAccountModalProps) => {
  return (
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
            startContent={isLoading ? <Spinner size="sm" color="white" /> : <TrashIcon className="h-4 w-4" />}
          >
            <Trans>I understand, delete my account</Trans>
          </Button>
        </div>
      }
      modalProps={{
        size: "lg"
      }}
    />
  );
};
