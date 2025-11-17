/*
  Warnings:

  - A unique constraint covering the columns `[name,location]` on the table `Store` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Store_name_location_key" ON "Store"("name", "location");
