import { z } from "zod";
import { type ZodOpenApiPathsObject, extendZodWithOpenApi } from "zod-openapi";
import { PriceSchema } from "~/applications/Prices/Domain/Entities/Price";
import { ProductSchema } from "~/applications/Prices/Domain/Entities/Product";
import { StoreSchema } from "~/applications/Prices/Domain/Entities/Store";

extendZodWithOpenApi(z);

export const paths: ZodOpenApiPathsObject = {
  "/v1/prices/search": {
    get: {
      operationId: "searchPrices",
      summary: "Search for a price",
      description:
        "Creates a new price entry for a product, allowing users to add price information for a product found in a specific store. The route accepts details such as the product's barcode, name, brand, category, store location, price, and a link to a proof image. This enables the application to update its database with current prices from various stores, helping users compare prices effectively.",
      requestParams: {
        query: z.object({
          q: z.string().openapi({
            example: "id",
            param: {
              in: "query",
              name: "q",
              description: 'Defines the type of activity log entries to retrieve, such as "date" or "id"',
              example: "date"
            }
          })
        })
      },
      requestBody: {
        description: "The price to create.",
        content: {}
      },
      responses: {
        "200": {
          description: "The burger was created successfully.",
          content: {
            "application/json": {
              schema: z.object({
                prices: PriceSchema.extend({ product: ProductSchema.nullable(), store: StoreSchema })
                  .array()
                  .nullable(),
                reason: z.literal("NO_PRICES").nullable().optional()
              })
            }
          }
        }
      }
    }
  }
};
