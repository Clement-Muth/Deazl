import { PriceDetails } from "~/applications/Prices/Ui/NewPrice/FormSteps/Step1/PriceDetails";
import { Location } from "~/applications/Prices/Ui/NewPrice/FormSteps/Step2/Location";

interface FormStepsProps {
  step: number;
  productName: string;
  hasStore: boolean;
  onNextStep: (data: any) => Promise<void>;
  onLastStep: (data: any) => Promise<void>;
  onPrevious: () => void;
}

export const FormSteps = ({
  step,
  onNextStep,
  productName,
  hasStore,
  onPrevious,
  onLastStep
}: FormStepsProps) => {
  switch (step) {
    case 1:
      return <PriceDetails onNextStep={onNextStep} productName={productName} hasStore={hasStore} />;
    case 2:
      return <Location onNextStep={onLastStep} onPrevious={onPrevious} />;
  }
};
