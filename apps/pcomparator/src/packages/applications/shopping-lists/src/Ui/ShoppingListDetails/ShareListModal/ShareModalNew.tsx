"use client";

import { addToast } from "@heroui/react";
import { Trans } from "@lingui/react/macro";
import { ShareIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Modal } from "~/components/Modal/Modal";
import { addCollaborator } from "../../../Api/shoppingLists/share/addCollaborator.api";
import { generateShareLink } from "../../../Api/shoppingLists/share/generateShareLink.api";
import { getCollaborators } from "../../../Api/shoppingLists/share/getCollaborators.api";
import { removeCollaborator } from "../../../Api/shoppingLists/share/removeCollaborator.api";
import { updateCollaboratorRole } from "../../../Api/shoppingLists/share/updateCollaboratorRole.api";
import { updatePublicStatus } from "../../../Api/shoppingLists/share/updatePublicStatus.api";
import type { ShoppingListCollaborator } from "../../../Domain/Entities/ShoppingListCollaborator.entity";
import { ShareModalBody } from "./ShareModalBody";

type Collaborator = {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatar?: string;
  role: "OWNER" | "EDITOR" | "VIEWER";
};

const transformCollaborator = (dbCollaborator: ShoppingListCollaborator): Collaborator => ({
  id: dbCollaborator.collaboratorId,
  userId: dbCollaborator.userId,
  // @ts-ignore
  name: dbCollaborator.user.name || "",
  // @ts-ignore
  email: dbCollaborator.user.email || "",
  // @ts-ignore
  avatar: dbCollaborator.user.image || undefined,
  role: dbCollaborator.role
});

interface ShareModalNewProps {
  isOpen: boolean;
  onClose: () => void;
  listId: string;
  listName: string;
  ownerId: string;
}

export const ShareModalNew = ({ isOpen, onClose, listId, listName, ownerId }: ShareModalNewProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [shareLink, setShareLink] = useState("");
  const [isPublicLink, setIsPublicLink] = useState(false);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"EDITOR" | "VIEWER">("EDITOR");

  const loadData = useCallback(async () => {
    if (!isOpen) return;

    try {
      setIsLoading(true);

      // Load collaborators
      const dbCollaborators = await getCollaborators(listId);
      // @ts-ignore
      setCollaborators(dbCollaborators.map(transformCollaborator));

      // Generate share link
      const link = await generateShareLink(listId);
      setShareLink(link);
    } catch (error) {
      console.error("Failed to load share data:", error);
      addToast({
        title: <Trans>Error</Trans>,
        description: <Trans>Failed to load sharing information</Trans>,
        color: "danger"
      });
    } finally {
      setIsLoading(false);
    }
  }, [listId, isOpen]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddCollaborator = useCallback(async () => {
    if (!email.trim()) {
      addToast({
        title: <Trans>Error</Trans>,
        description: <Trans>Please enter an email address</Trans>,
        color: "warning"
      });
      return;
    }

    try {
      setIsLoading(true);
      const result = await addCollaborator({ shoppingListId: listId, email: email.trim(), role });

      if (!result.success) {
        if (result.error === "USER_NOT_FOUND") {
          addToast({
            title: <Trans>User Not Found</Trans>,
            description: (
              <Trans>
                No account exists with this email address. Please invite them to create an account first.
              </Trans>
            ),
            color: "warning"
          });
        } else if (result.error === "ALREADY_COLLABORATOR") {
          addToast({
            title: <Trans>Already Added</Trans>,
            description: <Trans>This user is already a collaborator on this list.</Trans>,
            color: "warning"
          });
        } else if (result.error === "UNAUTHORIZED") {
          addToast({
            title: <Trans>Unauthorized</Trans>,
            description: <Trans>Only the owner can add collaborators.</Trans>,
            color: "danger"
          });
        } else {
          addToast({
            title: <Trans>Error</Trans>,
            description: result.message || <Trans>Failed to add collaborator</Trans>,
            color: "danger"
          });
        }
        return;
      }

      addToast({
        title: <Trans>Success</Trans>,
        description: <Trans>Collaborator added successfully</Trans>,
        color: "success"
      });

      setEmail("");
      await loadData();
    } catch (error) {
      console.error("Failed to add collaborator:", error);
      addToast({
        title: <Trans>Error</Trans>,
        description: <Trans>Failed to add collaborator</Trans>,
        color: "danger"
      });
    } finally {
      setIsLoading(false);
    }
  }, [email, role, listId, loadData]);

  const handleRemoveCollaborator = useCallback(
    async (userId: string) => {
      try {
        setIsLoading(true);
        await removeCollaborator({ listId, userId });

        addToast({
          title: <Trans>Success</Trans>,
          description: <Trans>Collaborator removed</Trans>,
          color: "success"
        });

        await loadData();
      } catch (error) {
        console.error("Failed to remove collaborator:", error);
        addToast({
          title: <Trans>Error</Trans>,
          description: <Trans>Failed to remove collaborator</Trans>,
          color: "danger"
        });
      } finally {
        setIsLoading(false);
      }
    },
    [listId, loadData]
  );

  const handleUpdateRole = useCallback(
    async (userId: string, newRole: "EDITOR" | "VIEWER") => {
      try {
        setIsLoading(true);
        await updateCollaboratorRole({ listId, userId, role: newRole });

        addToast({
          title: <Trans>Success</Trans>,
          description: <Trans>Role updated</Trans>,
          color: "success"
        });

        await loadData();
      } catch (error) {
        console.error("Failed to update role:", error);
        addToast({
          title: <Trans>Error</Trans>,
          description: <Trans>Failed to update role</Trans>,
          color: "danger"
        });
      } finally {
        setIsLoading(false);
      }
    },
    [listId, loadData]
  );

  const handleTogglePublicLink = useCallback(
    async (value: boolean) => {
      try {
        setIsLoading(true);
        await updatePublicStatus({ listId, isPublic: value });
        setIsPublicLink(value);

        addToast({
          title: <Trans>Success</Trans>,
          description: value ? <Trans>Link is now public</Trans> : <Trans>Link is now private</Trans>,
          color: "success"
        });

        await loadData();
      } catch (error) {
        console.error("Failed to update public status:", error);
        addToast({
          title: <Trans>Error</Trans>,
          description: <Trans>Failed to update link status</Trans>,
          color: "danger"
        });
      } finally {
        setIsLoading(false);
      }
    },
    [listId, loadData]
  );

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(shareLink);
    addToast({
      title: <Trans>Success</Trans>,
      description: <Trans>Link copied to clipboard</Trans>,
      color: "success"
    });
  }, [shareLink]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      header={
        <div className="flex items-center gap-2">
          <ShareIcon className="h-5 w-5 text-primary-600" />
          <span className="text-lg md:text-xl font-semibold">
            <Trans>Share '{listName}'</Trans>
          </span>
        </div>
      }
      body={
        <ShareModalBody
          isLoading={isLoading}
          shareLink={shareLink}
          isPublicLink={isPublicLink}
          collaborators={collaborators}
          email={email}
          role={role}
          listName={listName}
          ownerId={ownerId}
          onEmailChange={setEmail}
          onRoleChange={setRole}
          onAddCollaborator={handleAddCollaborator}
          onRemoveCollaborator={handleRemoveCollaborator}
          onUpdateRole={handleUpdateRole}
          onTogglePublicLink={handleTogglePublicLink}
          onCopyLink={handleCopyLink}
        />
      }
      sheetHeight="lg"
      modalProps={{
        size: "2xl",
        scrollBehavior: "inside"
      }}
    />
  );
};
