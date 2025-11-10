import { ModalFooter } from "@heroui/react";
import { useLingui } from "@lingui/react/macro";
import { Trans } from "@lingui/react/macro";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { deletePrice } from "~/applications/Prices/Api/deletePrice";
import useForm from "~/components/Form/useForm";
import { Input } from "~/components/Inputs/Input/Input";
import { Modal } from "~/components/Modal/Modal";

interface DeletePriceModalProps {
  priceId: string;
  isOpen: boolean;
  onOpenChange: () => void;
  onClose: () => void;
}

export const DeletePriceModal = ({ priceId, isOpen, onOpenChange, onClose }: DeletePriceModalProps) => {
  const form = useForm<{ confirmation: string }>();
  const notify = () =>
    toast(<Trans>Price deleted</Trans>, {
      type: "success"
    });
  const { refresh } = useRouter();
  const { t } = useLingui();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onOpenChange={onOpenChange}
      header={
        <p>
          <Trans>Are you sure you want to delete this price?</Trans>
        </p>
      }
      body={
        <form.Form
          methods={form.methods}
          onSubmit={async () => {
            await deletePrice({ priceId: priceId });
            notify();
            onClose();
            refresh();
          }}
          actions={{
            nextProps: {
              color: "danger",
              isDisabled: !form.watch("confirmation")?.match("confirm")
            },
            prevProps: { title: <Trans>Cancel</Trans> },
            wrapper: ModalFooter
          }}
        >
          <p className="text-small text-default-500">
            <Trans>
              This action <b>CANNOT be undone</b>. Please be certain about your decision.
            </Trans>
          </p>
          <p className="text-small text-default-500 mb-6">
            <Trans>Deleting this price will delete all of its data. You cannot undo this action.</Trans>
          </p>
          <Input name="empty" hidden className="hidden" />
          <Input
            name="confirmation"
            label={<Trans>Type "{<Trans>confirm</Trans>}" to confirm</Trans>}
            placeholder={t`confirm`}
          />
        </form.Form>
      }
      isForm
    />
  );
};
