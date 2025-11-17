import { useLingui } from "@lingui/react/macro";
import { useState } from "react";
import { createPrice } from "~/applications/Prices/Api/createPrice";
import { Currency } from "~/applications/Prices/Domain/ValueObjects/Currency";
import { FormSteps } from "~/applications/Prices/Ui/NewPrice/FormSteps/FormSteps";
import { Modal } from "~/components/Modal/Modal";
import { Stepper } from "~/components/Stepper/Stepper";

interface NewProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenChange: (isOpen: boolean) => void;
  productId?: string;
  productName?: string;
  barcode?: string;
  selectedStore?: { id: string; name: string; location: string } | null;
  onSuccessfull: (productName: string) => void;
}

export const NewPriceModal = ({
  isOpen,
  onClose,
  productId,
  productName,
  barcode,
  selectedStore,
  onOpenChange,
  onSuccessfull
}: NewProductModalProps) => {
  const { t } = useLingui();
  const [step, setStep] = useState<number>(1);
  const hasStore = !!selectedStore;
  const [productData, setProductData] = useState<{
    price?: number;
    unit?: string;
    proof?: Blob;
    storeName?: string;
    location?: string;
  }>({});

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onOpenChange={onOpenChange}
      modalProps={{ size: "4xl" }}
      header={
        hasStore ? (
          <div className="text-center py-2">
            <h3 className="text-lg font-semibold">{t`Add price`}</h3>
            <p className="text-sm text-gray-500">{selectedStore.name}</p>
          </div>
        ) : (
          <Stepper steps={[{ label: t`Price & Photo` }, { label: t`Store` }]} currentStep={step} />
        )
      }
      body={
        <FormSteps
          step={step}
          productName={productName || ""}
          hasStore={hasStore}
          onNextStep={async (data) => {
            setProductData((product) => ({ ...product, ...data }));
            // Si un magasin est sélectionné, on crée directement le prix
            if (hasStore) {
              const product = await createPrice({
                productId: productId,
                productName: productName || "",
                barcode: barcode,
                amount: data.price!,
                currency: Currency.Euro,
                unit: data.unit || "unit",
                proof: data.proof,
                location: selectedStore.location,
                storeName: selectedStore.name
              });
              onSuccessfull(product.name);
              onClose();
            } else {
              setStep((currentStep) => currentStep + 1);
            }
          }}
          onLastStep={async (data) => {
            const finalProductData = { ...productData, ...data };

            const product = await createPrice({
              productId: productId,
              productName: productName || "",
              barcode: barcode,
              amount: finalProductData.price!,
              currency: Currency.Euro,
              unit: finalProductData.unit || "unit",
              proof: finalProductData.proof,
              location: finalProductData.location!,
              storeName: finalProductData.storeName!
            });
            onSuccessfull(product.name);
            onClose();
          }}
          onPrevious={() => setStep((currentStep) => currentStep - 1)}
        />
      }
      isForm
    />
  );
};
