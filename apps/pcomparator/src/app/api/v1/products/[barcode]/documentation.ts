import { z } from "zod";
import { type ZodOpenApiPathsObject, extendZodWithOpenApi } from "zod-openapi";
import { PriceSchema } from "~/applications/Prices/Domain/Entities/Price";
import { ProductSchema } from "~/applications/Prices/Domain/Entities/Product";
import { StoreSchema } from "~/applications/Prices/Domain/Entities/Store";

extendZodWithOpenApi(z);

export const paths: ZodOpenApiPathsObject = {
  "/v1/products/{barcode}": {
    post: {
      operationId: "createProduct",
      summary: "Create a product",
      description:
        "Creates a new product entry, allowing users to add price information for a product found in a specific store. The route accepts details such as the product's barcode, name, brand, category, store location, price, and a link to a proof image. This enables the application to update its database with current prices from various stores, helping users compare prices effectively.",
      requestParams: {
        path: z.object({
          barcode: z.string().openapi({
            example: "876456789",
            param: {
              in: "path",
              name: "barcode",
              description: "barcode of the new product",
              example: "876456789"
            }
          })
        })
      },
      requestBody: {
        description: "The product to create.",
        content: {
          "application/json": {
            schema: z.object({
              productName: z.string(),
              categoryName: z.string(),
              brandName: z.string()
            })
          }
        }
      },
      responses: {
        "200": {
          description: "The burger was created successfully.",
          content: {
            "application/json": {
              schema: PriceSchema.extend({ product: ProductSchema, store: StoreSchema }).array()
            }
          }
        }
      }
    }
  }
};
