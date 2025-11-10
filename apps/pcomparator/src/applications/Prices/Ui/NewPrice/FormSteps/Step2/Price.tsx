import { Select, SelectItem } from "@heroui/react";
import { Trans, useLingui } from "@lingui/react/macro";
import { Euro } from "lucide-react";
import useForm from "~/components/Form/useForm";
import { Input } from "~/components/Inputs/Input/Input";

interface PriceProps {
  onNextStep: ({ price, unit }: { price: number; unit: string }) => Promise<void>;
  onPrevious: () => void;
}

const UNITS = [
  { key: "kg", label: "Kilogramme (kg)" },
  { key: "g", label: "Gramme (g)" },
  { key: "l", label: "Litre (l)" },
  { key: "ml", label: "Millilitre (ml)" },
  { key: "unit", label: "Unité" }
];

export const Price = ({ onNextStep, onPrevious }: PriceProps) => {
  const form = useForm<{ price: string; unit: string }>();
  const { i18n } = useLingui();

  return (
    <>
      <form.Form
        methods={form.methods}
        onSubmit={async (data) => {
          try {
            await onNextStep({ price: Number(data.price), unit: data.unit || "kg" });
          } catch (error) {
            form.setError("price", { message: "An error occured, please try later." });
          }
        }}
        actions={{
          nextProps: { title: <Trans>Next</Trans>, color: "primary" },
          prevProps: { title: <Trans>Previous</Trans>, onPress: onPrevious }
        }}
      >
        {/* NOTE – Adding this hidden input to fix nextui modal error... */}
        <Input name="empty" className="hidden" hidden />
        <div className="flex gap-4">
          <Input
            name="price"
            type="number"
            placeholder="9.99"
            label={<Trans>Price</Trans>}
            endContent={<Euro />}
            required={i18n._("Please enter a valid price.")}
            className="flex-1"
          />
          <Select
            name="unit"
            label={<Trans>Unit</Trans>}
            placeholder={i18n._("Select unit")}
            defaultSelectedKeys={["kg"]}
            className="flex-1"
          >
            {UNITS.map((unit) => (
              <SelectItem key={unit.key} value={unit.key}>
                {unit.label}
              </SelectItem>
            ))}
          </Select>
        </div>
      </form.Form>
    </>
  );
};
