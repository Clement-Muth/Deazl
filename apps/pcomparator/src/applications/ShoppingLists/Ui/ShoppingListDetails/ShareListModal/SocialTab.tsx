import { Button, Input } from "@heroui/react";
import { CopyIcon, FacebookIcon, LinkIcon, MailIcon, PhoneIcon, Share2Icon, TwitterIcon } from "lucide-react";

interface SocialTabProps {
  onOpenShareWindow: (url: string) => void;
  shareLink: string;
  whatsappLink: string;
  facebookLink: string;
  twitterLink: string;
  emailLink: string;
  listName: string;
  onCopyShareLink: () => void;
  inputLinkRef: React.RefObject<HTMLInputElement | null>;
}

export const SocialTab = ({
  onOpenShareWindow,
  shareLink,
  whatsappLink,
  facebookLink,
  twitterLink,
  emailLink,
  listName,
  onCopyShareLink,
  inputLinkRef
}: SocialTabProps) => (
  <div className="space-y-5">
    <h3 className="text-sm font-semibold text-gray-700">Share on social media</h3>
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      <Button
        color="default"
        variant="flat"
        className="h-20 flex-col"
        onPress={() => onOpenShareWindow(whatsappLink)}
      >
        <span className="flex items-center justify-center w-10 h-10 bg-green-500 text-white rounded-full mb-1">
          <PhoneIcon className="h-6 w-6" />
        </span>
        <span className="text-sm">WhatsApp</span>
      </Button>

      <Button
        color="default"
        variant="flat"
        className="h-20 flex-col"
        onPress={() => onOpenShareWindow(facebookLink)}
      >
        <span className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-full mb-1">
          <FacebookIcon className="h-6 w-6" />
        </span>
        <span className="text-sm">Facebook</span>
      </Button>

      <Button
        color="default"
        variant="flat"
        className="h-20 flex-col"
        onPress={() => onOpenShareWindow(twitterLink)}
      >
        <span className="flex items-center justify-center w-10 h-10 bg-black text-white rounded-full mb-1">
          <TwitterIcon className="h-6 w-6" />
        </span>
        <span className="text-sm">Twitter</span>
      </Button>

      <Button
        color="default"
        variant="flat"
        className="h-20 flex-col"
        onPress={() => window.open(emailLink, "_blank")}
      >
        <span className="flex items-center justify-center w-10 h-10 bg-gray-500 text-white rounded-full mb-1">
          <MailIcon className="h-6 w-6" />
        </span>
        <span className="text-sm">Email</span>
      </Button>

      <Button
        color="default"
        variant="flat"
        className="h-20 flex-col"
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
        <span className="flex items-center justify-center w-10 h-10 bg-primary-500 text-white rounded-full mb-1">
          <Share2Icon className="h-6 w-6" />
        </span>
        <span className="text-sm">More</span>
      </Button>
    </div>

    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-4">
      <div className="flex items-center justify-between gap-2 mb-3">
        <p className="text-sm">Copy link to share anywhere</p>
        <Button
          size="sm"
          color="primary"
          onPress={onCopyShareLink}
          startContent={<CopyIcon className="h-4 w-4" />}
        >
          Copy
        </Button>
      </div>

      <Input
        ref={inputLinkRef}
        value={shareLink}
        startContent={<LinkIcon className="h-4 w-4 text-gray-400" />}
        className="w-full"
        readOnly
        size="sm"
        onClick={(e) => (e.target as HTMLInputElement).select()}
      />
    </div>
  </div>
);
