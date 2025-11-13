"use client";

import { Button, Chip, Input, Select, SelectItem, Spinner, Switch, User } from "@heroui/react";
import { Trans } from "@lingui/react/macro";
import {
  CopyIcon,
  LinkIcon,
  MailIcon,
  PhoneIcon,
  PlusIcon,
  SendIcon,
  TrashIcon,
  UserIcon
} from "lucide-react";
import { useState } from "react";

interface Collaborator {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatar?: string;
  role: "OWNER" | "EDITOR" | "VIEWER";
}

interface ShareRecipeModalBodyProps {
  isLoading: boolean;
  shareLink: string;
  isPublicLink: boolean;
  collaborators: Collaborator[];
  email: string;
  role: "EDITOR" | "VIEWER";
  recipeName: string;
  ownerId: string;
  onEmailChange: (email: string) => void;
  onRoleChange: (role: "EDITOR" | "VIEWER") => void;
  onAddCollaborator: () => void;
  onRemoveCollaborator: (userId: string) => void;
  onUpdateRole: (userId: string, role: "EDITOR" | "VIEWER") => void;
  onTogglePublicLink: (value: boolean) => void;
  onCopyLink: () => void;
}

export const ShareRecipeModalBody = ({
  isLoading,
  shareLink,
  isPublicLink,
  collaborators,
  email,
  role,
  recipeName,
  onEmailChange,
  onRoleChange,
  onAddCollaborator,
  onRemoveCollaborator,
  onUpdateRole,
  onTogglePublicLink,
  onCopyLink
}: ShareRecipeModalBodyProps) => {
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  if (isLoading && collaborators.length === 0) {
    return (
      <div className="flex justify-center items-center py-8">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  const emailLink = `mailto:?subject=${encodeURIComponent(`Recipe: ${recipeName}`)}&body=${encodeURIComponent(`Check out my recipe: ${shareLink}`)}`;
  const whatsappLink = `https://wa.me/?text=${encodeURIComponent(`Check out my recipe "${recipeName}": ${shareLink}`)}`;

  return (
    <div className="space-y-6">
      {/* Add Collaborator Section */}
      <div className="space-y-3">
        <h3 className="font-semibold text-sm md:text-base text-gray-700">
          <Trans>Add Collaborator</Trans>
        </h3>
        <div className="bg-gray-50 p-3 md:p-4 rounded-lg border border-gray-200 space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              placeholder="email@example.com"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              startContent={<MailIcon className="h-4 w-4 text-gray-400" />}
              className="flex-1"
              size="sm"
              classNames={{
                input: "text-sm",
                inputWrapper: "h-10"
              }}
            />
            <Select
              selectedKeys={new Set([role])}
              onSelectionChange={(keys) => onRoleChange(Array.from(keys)[0] as "EDITOR" | "VIEWER")}
              className="w-32"
              size="sm"
              aria-label="Select role"
              classNames={{
                trigger: "h-10"
              }}
              renderValue={(items) => {
                const item = items[0];
                return item?.key === "EDITOR" ? <Trans>Can edit</Trans> : <Trans>Can view</Trans>;
              }}
            >
              <SelectItem key="EDITOR">
                <Trans>Can edit</Trans>
              </SelectItem>
              <SelectItem key="VIEWER">
                <Trans>Can view</Trans>
              </SelectItem>
            </Select>
          </div>
          <Button
            color="primary"
            isLoading={isLoading}
            isDisabled={!email.trim() || isLoading}
            onPress={onAddCollaborator}
            startContent={!isLoading && <PlusIcon size={16} />}
            className="w-full"
            size="sm"
          >
            <Trans>Add Collaborator</Trans>
          </Button>
        </div>
      </div>

      {/* Collaborators List */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-sm md:text-base text-gray-700">
            <Trans>People with access</Trans>
          </h3>
          <span className="text-xs text-gray-500">
            {collaborators.length} {collaborators.length === 1 ? "person" : "people"}
          </span>
        </div>

        <div className="space-y-2">
          {collaborators.map((collaborator) => {
            const isOwner = collaborator.role === "OWNER";
            const isEditing = editingUserId === collaborator.userId;

            return (
              <div
                key={collaborator.id}
                className="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <User
                  name={collaborator.name}
                  description={collaborator.email}
                  avatarProps={{
                    src: collaborator.avatar,
                    icon: <UserIcon size={16} />,
                    className: "bg-primary-100 text-primary-600"
                  }}
                  classNames={{
                    name: "text-sm font-medium",
                    description: "text-xs text-gray-500"
                  }}
                />

                <div className="flex items-center gap-2">
                  {isEditing && !isOwner ? (
                    <Select
                      selectedKeys={new Set([collaborator.role])}
                      onSelectionChange={(keys) => {
                        const newRole = Array.from(keys)[0] as "EDITOR" | "VIEWER";
                        onUpdateRole(collaborator.userId, newRole);
                        setEditingUserId(null);
                      }}
                      className="w-28"
                      size="sm"
                      aria-label="Change role"
                      classNames={{
                        trigger: "h-8"
                      }}
                      renderValue={(items) => {
                        const item = items[0];
                        return item?.key === "EDITOR" ? <Trans>Can edit</Trans> : <Trans>Can view</Trans>;
                      }}
                    >
                      <SelectItem key="EDITOR">
                        <Trans>Can edit</Trans>
                      </SelectItem>
                      <SelectItem key="VIEWER">
                        <Trans>Can view</Trans>
                      </SelectItem>
                    </Select>
                  ) : (
                    <Chip
                      color={isOwner ? "primary" : collaborator.role === "EDITOR" ? "success" : "default"}
                      variant="flat"
                      size="sm"
                      onClick={() => !isOwner && setEditingUserId(collaborator.userId)}
                      className={!isOwner ? "cursor-pointer" : ""}
                    >
                      {isOwner ? (
                        <Trans>Owner</Trans>
                      ) : collaborator.role === "EDITOR" ? (
                        <Trans>Can edit</Trans>
                      ) : (
                        <Trans>Can view</Trans>
                      )}
                    </Chip>
                  )}

                  {!isOwner && (
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      color="danger"
                      onPress={() => onRemoveCollaborator(collaborator.userId)}
                      isDisabled={isLoading}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Share Link Section */}
      <div className="space-y-3">
        <h3 className="font-semibold text-sm md:text-base text-gray-700">
          <Trans>Share Link</Trans>
        </h3>
        <div className="bg-gray-50 p-3 md:p-4 rounded-lg border border-gray-200 space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <Input
              value={shareLink}
              startContent={<LinkIcon className="h-4 w-4 text-gray-400" />}
              className="flex-1"
              readOnly
              size="sm"
              onClick={(e) => (e.target as HTMLInputElement).select()}
              classNames={{
                input: "text-sm",
                inputWrapper: "h-10"
              }}
            />
            <Button
              color="primary"
              onPress={onCopyLink}
              startContent={<CopyIcon className="h-4 w-4" />}
              size="sm"
              className="w-full sm:w-auto"
            >
              <Trans>Copy</Trans>
            </Button>
          </div>

          <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-200">
            <span className="text-sm text-gray-700">
              <Trans>Anyone with the link can view</Trans>
            </span>
            <Switch
              isSelected={isPublicLink}
              onValueChange={onTogglePublicLink}
              color="primary"
              size="sm"
              isDisabled={isLoading}
            />
          </div>
        </div>
      </div>

      {/* Quick Share Options */}
      <div className="space-y-3">
        <h3 className="font-semibold text-sm md:text-base text-gray-700">
          <Trans>Quick Share</Trans>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <Button
            color="default"
            variant="flat"
            startContent={<MailIcon className="h-4 w-4" />}
            size="sm"
            onPress={() => window.open(emailLink, "_blank")}
            className="justify-start"
          >
            <Trans>Email</Trans>
          </Button>
          <Button
            color="default"
            variant="flat"
            size="sm"
            startContent={
              <span className="flex items-center justify-center w-4 h-4 bg-green-500 text-white rounded-full">
                <PhoneIcon className="h-3 w-3" />
              </span>
            }
            onPress={() => window.open(whatsappLink, "_blank")}
            className="justify-start"
          >
            WhatsApp
          </Button>
          <Button
            color="default"
            variant="flat"
            size="sm"
            startContent={<SendIcon className="h-4 w-4 rotate-45 text-blue-500" />}
            onPress={() => {
              if (navigator.share) {
                navigator.share({
                  title: `Recipe: ${recipeName}`,
                  text: `Check out my recipe "${recipeName}"`,
                  url: shareLink
                });
              } else {
                onCopyLink();
              }
            }}
            className="justify-start col-span-2 sm:col-span-1"
          >
            <Trans>Share</Trans>
          </Button>
        </div>
      </div>
    </div>
  );
};
