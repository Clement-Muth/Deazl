import { z } from "zod";
import { type ZodOpenApiPathsObject, extendZodWithOpenApi } from "zod-openapi";
import { PriceSchema } from "~/applications/Prices/Domain/Entities/Price";
import { ProductSchema } from "~/applications/Prices/Domain/Entities/Product";
import { StoreSchema } from "~/applications/Prices/Domain/Entities/Store";

extendZodWithOpenApi(z);

const ExtendedPricesSchema = PriceSchema.extend({
  storeName: PriceSchema.shape.amount.openapi({
    default: 2.99,
    example: 2.99,
    description: "Amount of the price"
  }),
  product: ProductSchema,
  store: StoreSchema
})
  .array()
  .nullable();

export const paths: ZodOpenApiPathsObject = {
  "/v1/user/{id}/prices": {
    get: {
      parameters: [
        {
          in: "path",
          description: "id of the user",
          name: "id",
          example: "1bc0956b-c517-4b91-a3ca-1ebea5c60440",
          required: true,
          schema: { type: "string" }
        }
      ],
      operationId: "listPrices",
      summary: "List user prices.",
      description:
        "This operation retrieves a list of prices added by the specified user. The list includes detailed information for each price entry, such as the product name, price, location, and date added. This allows the user to review all their contributed price information in one place.",
      requestBody: {
        description: "No request body is required for this operation.",
        content: {}
      },
      responses: {
        "204": {
          description: "The account was deleted successfully."
        },
        200: {
          description: "Profile updated successfully.",
          content: {
            "application/json": {
              schema: ExtendedPricesSchema
            }
          }
        }
      }
    }
  }
};
