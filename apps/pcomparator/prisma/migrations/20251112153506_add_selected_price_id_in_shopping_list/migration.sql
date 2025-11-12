-- AlterTable
ALTER TABLE "ShoppingListItem" ADD COLUMN     "notes" TEXT,
ADD COLUMN     "selectedPriceId" UUID;

-- AddForeignKey
ALTER TABLE "ShoppingListItem" ADD CONSTRAINT "ShoppingListItem_selectedPriceId_fkey" FOREIGN KEY ("selectedPriceId") REFERENCES "Price"("id") ON DELETE SET NULL ON UPDATE CASCADE;
