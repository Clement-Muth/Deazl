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
import { Info } from "lucide-react";

interface NoPricesFoundProps {
  isOpen: boolean;
  onOpenChange: () => void;
  onCancel: () => void;
  onNewPrice: () => void;
}

export const NoPricesFound = ({ isOpen, onOpenChange, onCancel, onNewPrice }: NoPricesFoundProps) => (
  <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
    <ModalContent>
      <ModalHeader>
        <h2>No price found</h2>
      </ModalHeader>
      <ModalBody className="product-info">
        <p>We found the product you're looking for, but no price has been recorded yet.</p>

        <Card className="mb-4">
          <CardBody className="flex !flex-row gap-6 dark:bg-yellow-200/[0.06]">
            <Info color="#f4e28d" size="22px" />
            <div className="flex-1">
              <p className="text-small">
                <strong>Help us improve:</strong> You can add a price for this product to assist other users.
              </p>
            </div>
          </CardBody>
        </Card>
      </ModalBody>
      <ModalFooter>
        <Button onPress={onCancel}>Maybe later</Button>
        <Button color="primary" onPress={onNewPrice}>
          Add a price
        </Button>
      </ModalFooter>
    </ModalContent>
  </Modal>
);
