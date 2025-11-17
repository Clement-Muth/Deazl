"use client";

import {
  Button,
  Divider,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Tab,
  Tabs
} from "@heroui/react";
import { Trans } from "@lingui/react/macro";
import { Copy, Link2, Mail, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useRecipeShare } from "./useRecipeShare";

interface ShareRecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipeId: string;
  recipeName: string;
}

export default function ShareRecipeModal({ isOpen, onClose, recipeId, recipeName }: ShareRecipeModalProps) {
  const { isLoading, shareLink, collaborators, generateLink, inviteCollaborator } = useRecipeShare(recipeId);

  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"EDITOR" | "VIEWER">("EDITOR");
  const [activeTab, setActiveTab] = useState("invite");

  useEffect(() => {
    if (isOpen && !shareLink) {
      generateLink();
    }
  }, [isOpen, shareLink, generateLink]);

  const handleInvite = useCallback(async () => {
    if (!email) return;
    await inviteCollaborator(email, role);
    setEmail("");
  }, [email, role, inviteCollaborator]);

  const handleCopyLink = useCallback(() => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink);
    }
  }, [shareLink]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold">
            <Trans>Share Recipe</Trans>
          </h2>
          <p className="text-sm text-default-500">{recipeName}</p>
        </ModalHeader>

        <Divider />

        <ModalBody>
          <Tabs selectedKey={activeTab} onSelectionChange={(key) => setActiveTab(key as string)}>
            <Tab key="invite" title={<Trans>Invite People</Trans>}>
              <div className="flex flex-col gap-4 py-4">
                <div className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="email@example.com"
                    value={email}
                    onValueChange={setEmail}
                    startContent={<Mail className="h-4 w-4" />}
                    className="flex-1"
                  />
                  <Select
                    selectedKeys={[role]}
                    onChange={(e) => setRole(e.target.value as "EDITOR" | "VIEWER")}
                    className="w-32"
                  >
                    <SelectItem key="EDITOR">
                      <Trans>Editor</Trans>
                    </SelectItem>
                    <SelectItem key="VIEWER">
                      <Trans>Viewer</Trans>
                    </SelectItem>
                  </Select>
                  <Button color="primary" onPress={handleInvite} isLoading={isLoading} isDisabled={!email}>
                    <Trans>Invite</Trans>
                  </Button>
                </div>

                {collaborators.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <p className="text-sm font-medium">
                      <Trans>Collaborators</Trans>
                    </p>
                    {collaborators.map((collab) => (
                      <div
                        key={collab.id}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                            {collab.name?.charAt(0).toUpperCase() || collab.email.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{collab.name || collab.email}</p>
                            <p className="text-xs text-default-500">{collab.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-default-500">{collab.role}</span>
                          {collab.role !== "OWNER" && (
                            <Button isIconOnly size="sm" variant="light" color="danger">
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Tab>

            <Tab key="link" title={<Trans>Share Link</Trans>}>
              <div className="flex flex-col gap-4 py-4">
                <div className="flex gap-2">
                  <Input
                    value={shareLink}
                    readOnly
                    startContent={<Link2 className="h-4 w-4" />}
                    className="flex-1"
                  />
                  <Button
                    color="primary"
                    onPress={handleCopyLink}
                    startContent={<Copy className="h-4 w-4" />}
                  >
                    <Trans>Copy</Trans>
                  </Button>
                </div>
                <p className="text-xs text-default-500">
                  <Trans>Anyone with this link can view the recipe</Trans>
                </p>
              </div>
            </Tab>
          </Tabs>
        </ModalBody>

        <Divider />

        <ModalFooter>
          <Button color="danger" variant="light" onPress={onClose}>
            <Trans>Close</Trans>
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
