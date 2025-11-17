import { z } from "zod";
import { type ZodOpenApiPathsObject, extendZodWithOpenApi } from "zod-openapi";
import { ParamsSchema } from "~/app/api/v1/prices/route";
import { ProductSchema } from "~/applications/Prices/Domain/Entities/Product";
import { Currency } from "~/applications/Prices/Domain/ValueObjects/Currency";

extendZodWithOpenApi(z);

const ExtendedParamsSchema = ParamsSchema.extend({
  barcode: z.string().openapi({
    example: "8690804407383",
    description: "Unique identifier for the product in barcode format"
  }),
  storeName: ParamsSchema.shape.storeName.openapi({
    example: "Auchan",
    description: "Name of the store where the product is sold"
  }),
  productName: ParamsSchema.shape.productName.openapi({
    example: "Nutella",
    description: "Name of the product"
  }),
  categoryName: ParamsSchema.shape.categoryName.openapi({
    example: "Pate a tartiner",
    description: "Category of the product"
  }),
  brandName: ParamsSchema.shape.brandName.openapi({
    example: "Ferrero",
    description: "Brand or manufacturer of the product"
  }),
  location: ParamsSchema.shape.location.openapi({
    example: "4 rue du dome, 67000, Strasbourg",
    description: "Address of the store where the product was found"
  }),
  amount: ParamsSchema.shape.amount.openapi({ example: 9.99, description: "Price of the product" }),
  proof: ParamsSchema.shape.proof.openapi({
    example: "https://pcomparator/files",
    description: "Link to an image or file providing proof of the price"
  }),
  currency: ParamsSchema.shape.currency.openapi({
    example: Currency.Euro,
    description: "Currency used for the product price"
  })
});

const ExtendedProductSchema = ProductSchema.extend({
  id: ProductSchema.shape.id.openapi({ example: "010f21e3-c5b9-4d91-a5b1-b713d2324b17" }),
  barcode: ProductSchema.shape.barcode.openapi({ example: "8690804407383" }),
  name: ProductSchema.shape.name.openapi({ example: "Nutella" }),
  description: ProductSchema.shape.description.openapi({
    example: "Nutella is a sweet hazelnut and cocoa spread made by Ferrero."
  }),
  categoryId: ProductSchema.shape.categoryId.openapi({ example: "77230970-93e1-46ed-9797-85fc96d7eb0b" }),
  brandId: ProductSchema.shape.brandId.openapi({ example: "d0ecb566-74ee-4409-aeb3-31f30985a6f4" }),
  nutritionScore: ProductSchema.shape.nutritionScore.openapi({ example: "" }),
  createdAt: ProductSchema.shape.createdAt.openapi({ example: new Date() }),
  updatedAt: ProductSchema.shape.updatedAt.openapi({ example: new Date() })
});

export const paths: ZodOpenApiPathsObject = {
  "/v1/prices": {
    post: {
      operationId: "createPrice",
      summary: "Create a new price",
      description:
        "Creates a new price entry for a product, allowing users to add price information for a product found in a specific store. The route accepts details such as the product's barcode, name, brand, category, store location, price, and a link to a proof image. This enables the application to update its database with current prices from various stores, helping users compare prices effectively.",
      requestBody: {
        description: "The price to create.",
        content: {
          "application/json": {
            schema: ExtendedParamsSchema
          }
        }
      },
      responses: {
        "201": {
          description: "The burger was created successfully.",
          content: {
            "application/json": {
              schema: ExtendedProductSchema
            }
          }
        }
      }
    }
  }
};
