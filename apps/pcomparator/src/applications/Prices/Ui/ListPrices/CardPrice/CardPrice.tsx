"use client";

import { Card, CardBody, CardFooter, Image, useDisclosure } from "@heroui/react";
import { useRef } from "react";
import { SeeMoreMenu } from "~/applications/Prices/Ui/ListPrices/CardPrice/Dropdown";

interface CardPriceProps {
  proof: string;
  name: string;
  price: string;
  location: string;
  priceId: string;
}

export const CardPrice = (price: CardPriceProps) => {
  const { isOpen, onClose, onOpen, onOpenChange } = useDisclosure();
  const triggerRef = useRef(null);

  return (
    <>
      <Card shadow="sm" onPress={onOpen} ref={triggerRef} isPressable>
        <CardBody className="overflow-visible p-0">
          {price.proof && (
            <Image
              shadow="sm"
              radius="lg"
              alt={price.proof}
              className="object-cover h-[140px] w-[140px] aspect-square"
              src={price.proof}
            />
          )}
        </CardBody>
        <CardFooter className="text-small justify-between">
          <b>{price.name}</b>
          <p className="text-default-500">{price.price}</p>
        </CardFooter>
      </Card>
      <SeeMoreMenu
        isOpen={isOpen}
        onClose={onClose}
        onOpenChange={onOpenChange}
        price={price}
        triggerRef={triggerRef}
      />
    </>
  );
};
