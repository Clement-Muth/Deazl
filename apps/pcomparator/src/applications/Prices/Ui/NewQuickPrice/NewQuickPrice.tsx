import { useState } from "react";
import { Location } from "~/applications/Prices/Ui/NewPrice/FormSteps/Step2/Location";
import { Price } from "~/applications/Prices/Ui/NewQuickPrice/FormSteps/Price";
import { Modal } from "~/components/Modal/Modal";
import { Stepper } from "~/components/Stepper/Stepper";

interface NewQuickPriceProps {
  isOpen: boolean;
  onOpenChange: () => void;
  onClose: () => void;
  productName: string;
}

export const NewQuickPrice = ({ isOpen, onClose, onOpenChange, productName }: NewQuickPriceProps) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<{ price: number; location: string; storeName: string } | null>(
    null
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onOpenChange={onOpenChange}
      header={<Stepper steps={[{ label: "Price" }, { label: "Location" }]} currentStep={step} />}
      body={
        step === 1 ? (
          <Price
            onNextStep={(price) => {
              setFormData((formData) => ({ ...(formData as any), ...price }));
              setStep(2);
            }}
            productName={productName}
          />
        ) : (
          <Location
            onPrevious={() => setStep(1)}
            onNextStep={async (data) => {
              const finalData = { ...formData, ...data };
            }}
          />
        )
      }
      isForm
    />
  );
};
