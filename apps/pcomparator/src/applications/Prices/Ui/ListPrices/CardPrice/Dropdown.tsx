import { useDisclosure } from "@heroui/react";
import { Eye, Trash2 } from "lucide-react";
import { DeletePriceModal } from "~/applications/Prices/Ui/ListPrices/CardPrice/DeletePriceModal/DeletePriceModal";
import { SeeMoreModal } from "~/applications/Prices/Ui/ListPrices/CardPrice/SeeMoreMenu/SeeMoreModal";
import { Dropdown, type DropdownProps } from "~/components/Dropdown/Dropdown";

interface CardPriceDropdownProps {
  onClose: () => void;
  isOpen: boolean;
  onOpenChange: () => void;
  price: {
    proof: string;
    name: string;
    price: string;
    location: string;
    priceId: string;
  };
  triggerRef: any;
}

export const SeeMoreMenu = ({ onClose, onOpenChange, isOpen, price, triggerRef }: CardPriceDropdownProps) => {
  const {
    isOpen: isOpenSeeMore,
    onOpen: onOpenSeeMore,
    onOpenChange: onOpenChangeSeeMore,
    onClose: onCloseSeeMore
  } = useDisclosure();
  const {
    isOpen: isOpenDelete,
    onOpen: onOpenDelete,
    onOpenChange: onOpenChangeDelete,
    onClose: onCloseDelete
  } = useDisclosure();
  const items: DropdownProps["dropdownItems"] = [
    {
      key: "info",
      label: "See more",
      shortcut: "⌘⇧s",
      startContent: <Eye className="w-[18px] pointer-events-none flex-shrink-0" />,
      onPress: () => {
        onClose();
        onOpenSeeMore();
      }
    },
    // {
    //   key: "edit",
    //   label: "Edit price",
    //   shortcut: "⌘⇧E",
    //   startContent: <Pencil className="w-[18px] text-default-500 pointer-events-none flex-shrink-0" />
    // },
    {
      key: "delete",
      label: "Delete price",
      shortcut: "⌘⇧D",
      startContent: <Trash2 className="w-[18px] pointer-events-none flex-shrink-0" />,
      className: "text-danger",
      color: "danger",
      onPress: () => {
        onClose();
        onOpenDelete();
      }
    }
  ];

  return (
    <>
      <Dropdown
        dropdownItems={items}
        isOpen={isOpen}
        onClose={onClose}
        triggerRef={triggerRef}
        onOpenChange={onOpenChange}
      />
      {isOpenSeeMore ? (
        <SeeMoreModal
          isOpen={isOpenSeeMore}
          onOpenChange={onOpenChangeSeeMore}
          onClose={onCloseSeeMore}
          {...price}
        />
      ) : null}
      {isOpenDelete ? (
        <DeletePriceModal
          isOpen={isOpenDelete}
          onOpenChange={onOpenChangeDelete}
          onClose={onCloseDelete}
          priceId={price.priceId}
        />
      ) : null}
    </>
  );
};
