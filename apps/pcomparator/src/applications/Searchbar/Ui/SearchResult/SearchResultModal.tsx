import {
  Button,
  Card,
  CardBody,
  Image,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Spinner,
  useDisclosure
} from "@heroui/react";
import { Trans } from "@lingui/react/macro";
import { useEffect, useState, useTransition } from "react";
import type { Price } from "~/applications/Prices/Domain/Entities/Price";
import type { Product } from "~/applications/Prices/Domain/Entities/Product";
import type { Store } from "~/applications/Prices/Domain/Entities/Store";
import { getCurrencySymbol } from "~/applications/Prices/Domain/ValueObjects/Currency";
import { search as searchQuery } from "~/applications/Searchbar/Api/search";
import { searchByBarcode } from "~/applications/Searchbar/Api/searchByBarcode";

interface SearchResultProps {
  search: string;
  onNewProduct?: (productName: string, resultBarcode: object) => void;
  onNoPrices?: (barcode: string) => void;
}

export const SearchResultModal = ({ search, onNewProduct, onNoPrices }: SearchResultProps) => {
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
  const [prices, setPrices] = useState<(Price & { product: Product; store: Store })[] | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    !isOpen && onOpen();
    startTransition(async () => {
      try {
        const resultBarcode = await searchByBarcode({ barcode: search });

        if (!resultBarcode.success) throw new Error("Product not found");
        const formData = new FormData();

        formData.append("search", resultBarcode.name);
        const results = await searchQuery(null, formData);

        if (!results.success && results.reason === "NO_PRICES") {
          onClose();
          return onNoPrices?.(resultBarcode.product.code);
        }

        if (!results.prices && results.reason === "NO_PRODUCTS" && onNewProduct) {
          onNewProduct(results.search, {
            barcode: resultBarcode.product.code,
            name: resultBarcode.product.product_name,
            brandName: resultBarcode.product.brands,
            categoryName: "N/A"
          });
          onClose();
        }
        setPrices(results.prices as any);
      } catch (err) {
        console.error(err);
      }
    });
  }, []);

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        <ModalHeader>
          <p>
            <Trans>Prices for {search}</Trans>
          </p>
        </ModalHeader>
        <ModalBody>
          {!prices || pending ? (
            <Spinner />
          ) : (
            prices.map((price, i) => (
              <Card key={price.product.name + i}>
                <CardBody className="flex !flex-row gap-4">
                  <Image src={price.priceProofImage!} width={100} height={100} className="object-cover" />
                  <div className="flex flex-col justify-between">
                    <div>
                      <p className="font-bold text-lg">{price.product.name}</p>
                      <p className="text-small">{price.store.name} – 6km</p>
                    </div>
                    <p>
                      {getCurrencySymbol(price.currency)} {price.amount}
                    </p>
                  </div>
                </CardBody>
              </Card>
            ))
          )}
        </ModalBody>
        <ModalFooter>
          <Button size="md">
            <Trans>Close</Trans>
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
