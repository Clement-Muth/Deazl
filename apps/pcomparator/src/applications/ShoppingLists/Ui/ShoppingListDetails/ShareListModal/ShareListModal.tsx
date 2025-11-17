"use client";

import { Divider, Modal, ModalBody, ModalContent, ModalHeader, Tab, Tabs } from "@heroui/react";
import { Share2Icon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { InviteTab } from "./InviteTab";
import { LinkTab } from "./LinkTab";
import { QrCodeTab } from "./QrCodeTab";
import { SocialTab } from "./SocialTab";
import { useShareList } from "./useShareList";
import { useShoppingListShare } from "./useShoppingListShare";

const transformRole = (role: "EDITOR" | "VIEWER" | "OWNER"): "editor" | "viewer" | "owner" => {
  const roleMap = {
    EDITOR: "editor",
    VIEWER: "viewer",
    OWNER: "owner"
  } as const;
  return roleMap[role];
};

const transformCollaborators = (
  collaborators: Array<{
    id: string;
    name: string;
    email: string;
    avatar?: string;
    role: "EDITOR" | "VIEWER" | "OWNER";
  }>
) => {
  return collaborators.map((c) => ({
    ...c,
    role: transformRole(c.role)
  }));
};

interface ShareListModalProps {
  isOpen: boolean;
  onCloseAction: () => void;
  listId: string;
  listName: string;
}

export default function ShareListModal({ isOpen, onCloseAction, listId, listName }: ShareListModalProps) {
  const {
    isLoading: backendLoading,
    shareLink: dbShareLink,
    collaborators: dbCollaborators,
    generateLink,
    inviteCollaborator
  } = useShoppingListShare(listId);
  const [localCollaborators, setLocalCollaborators] = useState(() =>
    dbCollaborators ? transformCollaborators(dbCollaborators) : []
  );
  const {
    email,
    setEmail,
    activeTab,
    onCopyShareLink,
    onInvite: handleInvite,
    onRemoveCollaborator,
    openShareWindow,
    setActiveTab,
    inputLinkRef,
    isInviting,
    role,
    searchQuery,
    setIsPublicLink,
    setRole,
    isPublicLink
  } = useShareList(dbShareLink || "");

  const onInvite = useCallback(async () => {
    try {
      await inviteCollaborator(email, role.toUpperCase() as "EDITOR" | "VIEWER");
      await handleInvite();
    } catch (error) {
      console.error("Failed to invite:", error);
    }
  }, [email, role, inviteCollaborator, handleInvite]);

  useEffect(() => {
    if (dbCollaborators) {
      setLocalCollaborators(transformCollaborators(dbCollaborators));
    }
  }, [dbCollaborators]);

  useEffect(() => {
    if (isOpen && !dbShareLink) {
      generateLink();
    }
  }, [isOpen, dbShareLink, generateLink]);

  const shareLink = dbShareLink || "";
  const encodedListName = encodeURIComponent(listName);
  const whatsappLink = `https://wa.me/?text=Check out my shopping list "${encodedListName}": ${shareLink}`;
  const twitterLink = `https://twitter.com/intent/tweet?text=Check out my shopping list "${encodedListName}"&url=${shareLink}`;
  const facebookLink = `https://www.facebook.com/sharer/sharer.php?u=${shareLink}&quote=Check out my shopping list "${encodedListName}"`;
  const emailLink = `mailto:?subject=Check out my shopping list "${encodedListName}"&body=I wanted to share my shopping list with you: ${shareLink}`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCloseAction}
      size="4xl"
      scrollBehavior="inside"
      classNames={{
        base: "max-w-3xl md:max-w-4xl md:px-0",
        closeButton: "hidden md:flex",
        header: "p-3 md:p-4",
        body: "p-4 md:p-6"
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Share2Icon className="h-5 w-5 text-primary-600" />
            <span className="text-lg md:text-xl">Share "{listName}"</span>
          </div>

          <Tabs
            selectedKey={activeTab}
            onSelectionChange={setActiveTab as any}
            variant="underlined"
            color="primary"
            className="mt-2"
            aria-label="Share options"
            size="sm"
          >
            <Tab key="invite" title="Invite People" />
            <Tab key="link" title="Share Link" />
            <Tab key="social" title="Social Media" />
            <Tab key="qr" title="QR Code" />
          </Tabs>
        </ModalHeader>

        <Divider />

        <ModalBody>
          {activeTab === "invite" && (
            <InviteTab
              collaborators={localCollaborators}
              onRemoveCollaborator={(id) => onRemoveCollaborator(id)}
              email={email}
              onEmailChange={(email) => setEmail(email)}
              isInviting={isInviting || backendLoading}
              onInvite={onInvite}
              role={role}
              onRoleChange={(role) => setRole(role)}
              searchQuery={searchQuery}
            />
          )}

          {activeTab === "link" && (
            <LinkTab
              inputLinkRef={inputLinkRef}
              onCopyShareLink={onCopyShareLink}
              onIsPublicLinkChange={async (value) => {
                setIsPublicLink(value);
                await generateLink();
              }}
              isPublicLink={isPublicLink}
              shareLink={shareLink}
              emailLink={emailLink}
              whatsappLink={whatsappLink}
              listName={listName}
            />
          )}

          {activeTab === "social" && (
            <SocialTab
              shareLink={shareLink}
              whatsappLink={whatsappLink}
              twitterLink={twitterLink}
              facebookLink={facebookLink}
              emailLink={emailLink}
              onOpenShareWindow={(url) => openShareWindow(url)}
              inputLinkRef={inputLinkRef}
              onCopyShareLink={onCopyShareLink}
              listName={listName}
            />
          )}

          {activeTab === "qr" && <QrCodeTab onCopyShareLink={onCopyShareLink} shareLink={shareLink} />}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
