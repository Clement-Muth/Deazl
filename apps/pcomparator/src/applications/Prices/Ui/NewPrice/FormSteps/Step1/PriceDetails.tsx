import { Button, Image, Select, SelectItem } from "@heroui/react";
import { Trans, useLingui } from "@lingui/react/macro";
import { Camera, Euro, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { TakePicture } from "~/applications/Prices/Ui/NewPrice/FormSteps/Step3/TakePicture";
import useForm from "~/components/Form/useForm";
import { Input } from "~/components/Inputs/Input/Input";

interface PriceDetailsProps {
  onNextStep: (data: { price: number; unit: string; proof?: Blob }) => Promise<void>;
  productName: string;
  hasStore?: boolean;
}

const UNITS = [
  { key: "kg", label: "Kilogramme (kg)" },
  { key: "g", label: "Gramme (g)" },
  { key: "l", label: "Litre (l)" },
  { key: "ml", label: "Millilitre (ml)" },
  { key: "unit", label: "Unité" }
];

export const PriceDetails = ({ onNextStep, productName, hasStore = false }: PriceDetailsProps) => {
  const form = useForm<{ price: string; unit: string }>();
  const { i18n } = useLingui();
  const [isOpen, setIsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<Blob | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleRemove = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleProofTaken = (proofUrl: string) => {
    setPreview(proofUrl);
    fetch(proofUrl)
      .then((res) => res.blob())
      .then((blob) => setFile(blob));
    setIsOpen(false);
  };

  return (
    <>
      <form.Form
        methods={form.methods}
        onSubmit={async (data) => {
          try {
            await onNextStep({
              price: Number(data.price),
              unit: data.unit || "kg",
              proof: file || undefined
            });
          } catch (error) {
            form.setError("price", { message: "An error occured, please try later." });
          }
        }}
        actions={{
          nextProps: {
            title: hasStore ? <Trans>Confirm & Add</Trans> : <Trans>Next</Trans>,
            color: "primary"
          }
        }}
      >
        <div className="space-y-6">
          {/* Product name */}
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{productName}</h3>
            <p className="text-sm text-gray-500 mt-1">
              <Trans>Add price information</Trans>
            </p>
          </div>

          {/* Price and Unit */}
          <div className="flex gap-3">
            <Input
              name="price"
              type="number"
              step="0.01"
              placeholder="2.99"
              label={<Trans>Price</Trans>}
              endContent={<Euro size={18} />}
              required={i18n._("Please enter a valid price.")}
              className="flex-1"
              size="lg"
            />
            <Select
              name="unit"
              label={<Trans>Unit</Trans>}
              placeholder={i18n._("Unit")}
              defaultSelectedKeys={["unit"]}
              className="flex-1"
              size="lg"
            >
              {UNITS.map((unit) => (
                <SelectItem key={unit.key}>{unit.label}</SelectItem>
              ))}
            </Select>
          </div>

          {/* Proof photo (optional) */}
          <div className="space-y-3">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
              <Trans>Proof photo (optional)</Trans>
            </div>

            {preview ? (
              <div className="relative rounded-lg overflow-hidden">
                <Image src={preview} alt="Price proof" className="w-full h-48 object-cover" />
                <button
                  type="button"
                  onClick={handleRemove}
                  className="absolute top-2 right-2 bg-danger text-white rounded-full p-2 hover:bg-danger-600 transition-colors shadow-lg"
                >
                  <X size={18} />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button
                  startContent={<Camera size={18} />}
                  onPress={() => setIsOpen(true)}
                  variant="bordered"
                  className="flex-1"
                  size="lg"
                >
                  <Trans>Camera</Trans>
                </Button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-input"
                />
                <Button
                  as="label"
                  htmlFor="file-input"
                  startContent={<Upload size={18} />}
                  variant="bordered"
                  className="flex-1 cursor-pointer"
                  size="lg"
                >
                  <Trans>Gallery</Trans>
                </Button>
              </div>
            )}
          </div>
        </div>

        <TakePicture
          isOpen={isOpen}
          onOpenChange={() => setIsOpen(!isOpen)}
          onProofTaken={handleProofTaken}
          onClose={() => setIsOpen(false)}
        />
      </form.Form>
    </>
  );
};
