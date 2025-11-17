import { Button, Input, Switch } from "@heroui/react";
import { CopyIcon, LinkIcon, MailIcon, PhoneIcon, SendIcon } from "lucide-react";

interface LinkTabProps {
  shareLink: string;
  emailLink: string;
  whatsappLink: string;
  listName: string;
  isPublicLink: boolean;
  inputLinkRef: React.RefObject<HTMLInputElement | null>;
  onIsPublicLinkChange: (value: boolean) => void;
  onCopyShareLink: () => void;
}

export const LinkTab = ({
  shareLink,
  emailLink,
  whatsappLink,
  listName,
  isPublicLink,
  inputLinkRef,
  onIsPublicLinkChange,
  onCopyShareLink
}: LinkTabProps) => (
  <div className="space-y-5">
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3">
      <h3 className="text-sm font-semibold text-gray-700">Share link</h3>
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1">
          <Input
            ref={inputLinkRef}
            value={shareLink}
            startContent={<LinkIcon className="h-4 w-4 text-gray-400" />}
            className="w-full"
            readOnly
            onClick={(e) => (e.target as HTMLInputElement).select()}
          />
        </div>
        <Button color="primary" onPress={onCopyShareLink} startContent={<CopyIcon className="h-4 w-4" />}>
          Copy
        </Button>
      </div>

      <div className="flex items-center justify-between gap-2 pt-2">
        <div className="flex items-center gap-2">
          <Switch isSelected={isPublicLink} onValueChange={onIsPublicLinkChange} color="primary" size="sm" />
          <span className="text-sm">Anyone with the link can view</span>
        </div>
      </div>
    </div>

    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-gray-700">Share via email or message</h3>
      <div className="grid grid-cols-3 gap-2">
        <Button
          color="default"
          variant="flat"
          startContent={<MailIcon className="h-4 w-4" />}
          className="justify-start"
          onPress={() => window.open(emailLink, "_blank")}
        >
          Email
        </Button>
        <Button
          color="default"
          variant="flat"
          className="justify-start"
          startContent={
            <span className="flex items-center justify-center w-4 h-4 bg-green-500 text-white rounded-full">
              <PhoneIcon className="h-3 w-3" />
            </span>
          }
          onPress={() => window.open(whatsappLink, "_blank")}
        >
          WhatsApp
        </Button>
        <Button
          color="default"
          variant="flat"
          className="justify-start"
          startContent={<SendIcon className="h-4 w-4 rotate-45 text-blue-500" />}
          onPress={() => {
            if (navigator.share) {
              navigator.share({
                title: `Shopping List: ${listName}`,
                text: `Check out my shopping list "${listName}"`,
                url: shareLink
              });
            } else {
              onCopyShareLink();
            }
          }}
        >
          Message
        </Button>
      </div>
    </div>
  </div>
);
