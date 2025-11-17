import {
  Button,
  Card,
  CardBody,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader
} from "@heroui/react";
import { Trans } from "@lingui/react/macro";
import { Info } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "react-toastify";
import { createProduct } from "~/applications/Products/Api/createProduct";
import type { Product } from "~/applications/Products/Domain/Entities/Product";

interface ActionButtonsProps {
  onCancel: () => void;
}

const ActionButtons = ({ onCancel }: ActionButtonsProps) => {
  const { pending } = useFormStatus();

  return (
    <ModalFooter>
      <Button onPress={onCancel} isDisabled={pending}>
        <Trans>Maybe later</Trans>
      </Button>
      <Button color="primary" type="submit" isLoading={pending}>
        <Trans>Add this product</Trans>
      </Button>
    </ModalFooter>
  );
};

interface NewProductProps {
  isOpen: boolean;
  onOpenChange: () => void;
  onClose: () => void;
  resultBarcode: Product;
}

export const NewProduct = ({ isOpen, onOpenChange, onClose, resultBarcode }: NewProductProps) => {
  const [_, formAction] = useActionState(createProduct, null);
  const notify = () =>
    toast(<Trans>Product added</Trans>, {
      type: "success"
    });
  const { refresh } = useRouter();

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        <ModalHeader>
          <p>
            <Trans>Product Not Found</Trans>
          </p>
        </ModalHeader>
        <form
          action={() => {
            const newFormData = new FormData();

            newFormData.append("categoryName", "N/A");
            newFormData.append("brandName", resultBarcode.brandName);
            newFormData.append("name", resultBarcode.name);
            newFormData.append("barcode", resultBarcode.barcode);

            formAction(newFormData);
            notify();
            refresh();
            onClose();
          }}
        >
          <ModalBody>
            <p>Oops, we couldn't find this product in our database. Would you like to help us add it?</p>
            <Card className="mb-4">
              <CardBody className="flex !flex-row gap-6 dark:bg-yellow-200/[0.06]">
                <Info color="#f4e28d" size="22px" />
                <div className="flex-1">
                  <span className="text-small">
                    <b>This product can be added automatically</b>
                  </span>
                </div>
              </CardBody>
            </Card>
          </ModalBody>
          <ActionButtons onCancel={onClose} />
        </form>
      </ModalContent>
    </Modal>
  );
};
