import { Button, addToast } from "@heroui/react";
import { Trans } from "@lingui/react/macro";
import { CopyIcon, DownloadIcon } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { useRef } from "react";

interface QrCodeTabProps {
  shareLink: string;
  onCopyShareLink: () => void;
}

export const QrCodeTab = ({ shareLink, onCopyShareLink }: QrCodeTabProps) => {
  const qrRef = useRef<HTMLCanvasElement>(null);

  const downloadQRCode = () => {
    if (qrRef.current) {
      const canvas = qrRef.current;
      const url = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = url;
      link.download = "shopping-list-qr.png";
      link.click();
      addToast({
        title: <Trans>QR Code downloaded</Trans>,
        description: <Trans>The QR code has been downloaded</Trans>,
        variant: "solid",
        color: "success"
      });
    }
  };

  return (
    <div className="space-y-5 text-center">
      <h3 className="text-sm font-semibold text-gray 700">QR Code for this shopping list</h3>
      <div className="flex justify-center py-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200 inline-block">
          <QRCodeCanvas ref={qrRef} value={shareLink} size={200} level="H" includeMargin />
        </div>
      </div>
      <p className="text-sm text-gray-600">
        Scan this QR code with a smartphone camera to open the shopping list
      </p>
      <div className="flex justify-center gap-2 pt-2">
        <Button
          color="primary"
          size="sm"
          startContent={<CopyIcon className="h-4 w-4" />}
          onPress={() => {
            onCopyShareLink();
            addToast({
              title: <Trans>Link copied</Trans>,
              description: <Trans>The link has been copied to clipboard</Trans>,
              variant: "solid",
              color: "success"
            });
          }}
        >
          Copy Link
        </Button>
        <Button
          color="primary"
          size="sm"
          variant="flat"
          startContent={<DownloadIcon className="h-4 w-4" />}
          onPress={downloadQRCode}
        >
          Download QR Code
        </Button>
      </div>
    </div>
  );
};
