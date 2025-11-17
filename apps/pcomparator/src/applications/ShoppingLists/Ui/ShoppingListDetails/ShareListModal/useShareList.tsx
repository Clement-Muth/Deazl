import { addToast } from "@heroui/react";
import { Trans } from "@lingui/react/macro";
import { useSession } from "next-auth/react";
import { useCallback, useRef, useState } from "react";

type CollaboratorType = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "owner" | "editor" | "viewer";
};

export const useShareList = (shareLink: string) => {
  const [email, setEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<string>("invite");
  const [isPublicLink, setIsPublicLink] = useState(false);
  const [role, setRole] = useState<"editor" | "viewer">("editor");
  const inputLinkRef = useRef<HTMLInputElement>(null);
  const { data } = useSession();

  const [collaborators, setCollaborators] = useState<CollaboratorType[]>([
    {
      id: "1",
      name: data?.user?.name!,
      email: data?.user?.email!,
      avatar: "",
      role: "owner"
    }
  ]);

  const onInvite = async () => {
    if (!email) return;

    try {
      setIsInviting(true);

      setCollaborators([
        ...collaborators,
        {
          id: Date.now().toString(),
          name: email.split("@")[0],
          email,
          role
        }
      ]);

      setEmail("");

      addToast({
        title: <Trans>Invitation sent</Trans>,
        description: <Trans>An invitation has been sent to {email}</Trans>,
        variant: "solid",
        color: "success"
      });
    } catch (error) {
      console.error("Error inviting user:", error);
      addToast({
        title: <Trans>Error</Trans>,
        description: <Trans>Failed to send invitation</Trans>,
        variant: "solid",
        color: "danger"
      });
    } finally {
      setIsInviting(false);
    }
  };

  const onCopyShareLink = useCallback(() => {
    navigator.clipboard.writeText(shareLink);

    if (inputLinkRef.current) inputLinkRef.current.select();

    addToast({
      title: <Trans>Link copied</Trans>,
      description: <Trans>Share link copied to clipboard</Trans>,
      variant: "solid",
      color: "success"
    });
  }, [inputLinkRef, shareLink]);

  const onRemoveCollaborator = useCallback(
    (id: string) => {
      if (collaborators.find((c) => c.id === id)?.role === "owner") return;

      setCollaborators(collaborators.filter((c) => c.id !== id));
    },
    [collaborators]
  );

  const openShareWindow = (url: string) => {
    window.open(url, "_blank", "width=600,height=400");
  };

  return {
    email,
    setEmail,
    activeTab,
    setActiveTab,
    collaborators,
    onRemoveCollaborator,
    onCopyShareLink,
    onInvite,
    openShareWindow,
    isInviting,
    searchQuery,
    setRole,
    role,
    inputLinkRef,
    setIsPublicLink,
    isPublicLink
  };
};
