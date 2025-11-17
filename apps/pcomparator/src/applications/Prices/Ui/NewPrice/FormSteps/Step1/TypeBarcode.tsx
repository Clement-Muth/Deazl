import {} from "@heroui/react";
import { Trans } from "@lingui/react/macro";
import _ from "lodash";
import type { Barcode as BarcodeT } from "~/applications/Prices/Domain/ValueObjects/Barcode";
import useForm from "~/components/Form/useForm";
import { Barcode } from "~/components/Inputs/Input/Barcode";
import { Input } from "~/components/Inputs/Input/Input";

interface TypeBarcodeProps {
  onNextStep: ({ barcode }: { barcode: string }) => void;
  barcode: BarcodeT | undefined;
  // onCheckBarcode: (barcode: string) => Promise<Product | null>;
}

export const TypeBarcode = ({ onNextStep, barcode }: TypeBarcodeProps) => {
  const form = useForm<{ barcode: string; empty: never }>(undefined, {
    defaultValues: { barcode: barcode?.barcode }
  });

  return (
    <>
      <form.Form
        methods={form.methods}
        onSubmit={(data) => {
          try {
            onNextStep({ ..._.omit(data, "empty"), ...{ barcode: data.barcode } });
          } catch (error) {
            form.setError("barcode", { message: "An error occured, please try later." });
          }
        }}
        actions={{
          nextProps: { title: <Trans>Next</Trans>, color: "primary", type: "submit" }
        }}
      >
        {/* NOTE – Adding this hidden input to fix nextui modal error... */}
        <Input name="empty" className="hidden" hidden />
        <Barcode name="barcode" defaultValue={barcode?.barcode} />
      </form.Form>
    </>
  );
};
