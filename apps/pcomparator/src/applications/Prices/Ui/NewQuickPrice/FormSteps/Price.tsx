import { Card, CardBody, ModalBody, ModalFooter } from "@heroui/react";
import { Trans } from "@lingui/react/macro";
import { Info } from "lucide-react";
import useForm from "~/components/Form/useForm";
import { Input } from "~/components/Inputs/Input/Input";

interface PriceProps {
  onNextStep: (data: { price: number }) => void;
  productName: string;
}

export const Price = ({ onNextStep, productName }: PriceProps) => {
  const form = useForm<{ price: string }>();

  return (
    <form.Form
      methods={form.methods}
      onSubmit={(data) => onNextStep({ price: Number(data.price) })}
      actions={{
        wrapper: ModalFooter,
        nextProps: { color: "primary" }
      }}
    >
      <ModalBody>
        <Card className="mb-4">
          <CardBody className="flex !flex-row gap-6 dark:bg-yellow-200/[0.06]">
            <Info color="#f4e28d" size="22px" />
            <div className="flex-1">
              <p className="text-small">
                <Trans>Product "{productName}" was not found but added to your account.</Trans>
              </p>
              <p className="text-small mt-2">Add a price to validate it.</p>
            </div>
          </CardBody>
        </Card>
        {/* NOTE – Adding this hidden input to fix nextui modal error... */}
        <Input name="empty" className="hidden" hidden />
        <Input
          type="number"
          name="price"
          placeholder="2.99"
          label={<Trans>Price</Trans>}
          labelPlacement="outside"
          size="lg"
        />
      </ModalBody>
    </form.Form>
  );
};
