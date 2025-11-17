import {
  Avatar,
  Button,
  Chip,
  Input,
  Select,
  SelectItem,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow
} from "@heroui/react";
import { MailIcon, SendIcon, UserIcon, XIcon } from "lucide-react";

interface InviteTabProps {
  email: string;
  onEmailChange: (email: string) => void;
  role: "editor" | "viewer";
  onRoleChange: (role: "editor" | "viewer") => void;
  isInviting: boolean;
  onInvite: () => void;
  onRemoveCollaborator: (id: string) => void;
  collaborators: {
    id: string;
    avatar?: string;
    name: string;
    email: string;
    role: "editor" | "viewer" | "owner";
  }[];
  searchQuery?: string;
}

export const InviteTab = ({
  email,
  isInviting,
  onEmailChange,
  onRoleChange,
  role,
  onInvite,
  collaborators,
  searchQuery,
  onRemoveCollaborator
}: InviteTabProps) => (
  <div className="space-y-6">
    {/* Section d'invitation */}
    <div className="space-y-3">
      <h3 className="font-semibold text-gray-700">Invite people to collaborate</h3>
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3">
        <div className="flex gap-2">
          <Input
            placeholder="Enter email address"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            startContent={<MailIcon className="h-4 w-4 text-gray-400" />}
            className="flex-1"
          />
          <Select
            selectedKeys={[role]}
            onChange={(e) => onRoleChange(e.target.value as "editor" | "viewer")}
            className="w-32"
          >
            {/* @ts-ignore */}
            <SelectItem key="editor" value="editor">
              Can edit
            </SelectItem>
            {/* @ts-ignore */}
            <SelectItem key="viewer" value="viewer">
              Can view
            </SelectItem>
          </Select>
        </div>
        <Button
          color="primary"
          isLoading={isInviting}
          isDisabled={!email.trim() || isInviting}
          onPress={onInvite}
          startContent={<SendIcon size={16} />}
          className="w-full"
        >
          Send Invitation
        </Button>
      </div>
    </div>

    {/* Liste des collaborateurs */}
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-gray-700">People with access</h3>
      </div>

      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <Table aria-label="Collaborators" removeWrapper isStriped>
          <TableHeader>
            <TableColumn>NAME</TableColumn>
            <TableColumn>ACCESS</TableColumn>
            {/* @ts-ignore */}
            <TableColumn width={80} />
          </TableHeader>
          <TableBody emptyContent="No collaborators found">
            {collaborators
              .filter(
                (c) =>
                  !searchQuery ||
                  c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  c.email.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((collaborator) => (
                <TableRow key={collaborator.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar
                        name={collaborator.name}
                        src={collaborator.avatar}
                        className="bg-primary-100 text-primary-600"
                        icon={<UserIcon size={16} />}
                      />
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {collaborator.name} {collaborator.role === "owner" && "(you)"}
                        </span>
                        <span className="text-xs text-gray-500">{collaborator.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Chip
                      color={
                        collaborator.role === "owner"
                          ? "primary"
                          : collaborator.role === "editor"
                            ? "primary"
                            : "default"
                      }
                      variant="flat"
                    >
                      {collaborator.role === "owner"
                        ? "Owner"
                        : collaborator.role === "editor"
                          ? "Can edit"
                          : "Can view"}
                    </Chip>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      isIconOnly
                      variant="light"
                      disabled={collaborator.role === "owner"}
                      onPress={() => onRemoveCollaborator(collaborator.id)}
                    >
                      <XIcon className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
    </div>
  </div>
);
