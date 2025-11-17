import { Modal, ModalBody, ModalContent } from "@heroui/react";
import { Edit3Icon, Share2Icon, TrashIcon } from "lucide-react";

interface MoreActionModalProps {
  shoppingListId: string;
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onShare: () => void;
}

export const MoreActionModal = ({
  shoppingListId,
  isOpen,
  onClose,
  onDelete,
  onEdit,
  onShare
}: MoreActionModalProps) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    classNames={{
      base: "bg-white dark:bg-gray-800 shadow-lg rounded-lg",
      body: "p-0"
    }}
    size="4xl"
  >
    <ModalContent>
      <ModalBody className="p-0">
        <div className="divide-y divide-gray-100">
          <div
            className="flex items-center gap-2 py-3 px-4 cursor-pointer hover:bg-primary-50 transition-colors"
            onClick={() => {
              onClose();
              onEdit();
            }}
          >
            <Edit3Icon className="h-4 w-4 text-primary-600" />
            <div className="flex flex-col">
              <span className="font-medium">Edit List</span>
              <span className="text-sm text-gray-500">Update list name and description</span>
            </div>
          </div>

          <div
            className="flex items-center gap-2 py-3 px-4 cursor-pointer hover:bg-primary-50 transition-colors"
            onClick={() => {
              onClose();
              onShare();
            }}
          >
            <Share2Icon className="h-4 w-4 text-primary-600" />
            <div className="flex flex-col">
              <span className="font-medium">Share List</span>
              <span className="text-sm text-gray-500">Share this list with others</span>
            </div>
          </div>

          <div
            className="flex items-center gap-2 py-3 px-4 cursor-pointer hover:bg-red-50 text-red-600 transition-colors"
            onClick={() => {
              onClose();
              onDelete();
            }}
          >
            <TrashIcon className="h-4 w-4" />
            <div className="flex flex-col">
              <span className="font-medium">Delete List</span>
              <span className="text-sm text-gray-500">Delete this shopping list</span>
            </div>
          </div>
        </div>
      </ModalBody>
    </ModalContent>
  </Modal>
);
