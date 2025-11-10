import { Button, Image, ModalBody, ModalFooter, useDisclosure } from "@heroui/react";
import { Trans } from "@lingui/react/macro";
import { Camera, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { TakePicture } from "~/applications/Prices/Ui/NewPrice/FormSteps/Step3/TakePicture";
import useForm from "~/components/Form/useForm";

interface ProofProps {
  onNextStep: (data: { proof?: Blob }) => Promise<void>;
  onPrevious: () => void;
}

export const Proof = ({ onNextStep, onPrevious }: ProofProps) => {
  const form = useForm();
  const { isOpen, onOpenChange, onOpen, onClose } = useDisclosure();
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
    // Convert data URL to Blob
    fetch(proofUrl)
      .then((res) => res.blob())
      .then((blob) => setFile(blob));
    onClose();
  };

  return (
    <form.Form
      methods={form.methods}
      onSubmit={async () => {
        await onNextStep({ proof: file || undefined });
      }}
      actions={{
        nextProps: { title: <Trans>Next</Trans>, color: "primary" },
        prevProps: { title: <Trans>Previous</Trans>, onPress: onPrevious },
        wrapper: ModalFooter
      }}
    >
      <ModalBody>
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              <Trans>Add a photo of the price tag or receipt (optional)</Trans>
            </p>
          </div>

          {preview ? (
            <div className="relative">
              <Image src={preview} alt="Price proof" className="w-full h-64 object-cover rounded-lg" />
              <button
                type="button"
                onClick={handleRemove}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <Button startContent={<Camera />} onPress={onOpen} variant="bordered" className="w-full">
                <Trans>Take a picture</Trans>
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
                startContent={<Upload />}
                variant="bordered"
                className="w-full cursor-pointer"
              >
                <Trans>Upload from gallery</Trans>
              </Button>
            </div>
          )}

          <p className="text-xs text-gray-500 text-center">
            <Trans>This helps verify the price and improves data quality</Trans>
          </p>
        </div>

        <TakePicture
          isOpen={isOpen}
          onOpenChange={onOpenChange}
          onProofTaken={handleProofTaken}
          onClose={onClose}
        />
      </ModalBody>
    </form.Form>
  );
};
