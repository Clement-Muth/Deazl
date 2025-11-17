import { z } from "zod";
import { type ZodOpenApiPathsObject, extendZodWithOpenApi } from "zod-openapi";

extendZodWithOpenApi(z);

export const paths: ZodOpenApiPathsObject = {
  "/v1/user/{id}/prices/{priceId}": {
    delete: {
      parameters: [
        {
          in: "path",
          description: "id of the user",
          name: "id",
          required: true,
          example: "1bc0956b-c517-4b91-a3ca-1ebea5c60440",
          schema: { type: "string" }
        },
        {
          in: "path",
          description: "id of the price to delete",
          name: "priceId",
          example: "390c21e2-5c18-4d85-8f40-9ea3486b2675",
          required: true,
          schema: { type: "string" }
        }
      ],
      operationId: "deleteUserPrice",
      summary: "Delete a user price.",
      description:
        "This operation allows the specified user to delete a specific price entry they previously added. When executed, the request removes the selected price entry from the database, ensuring it no longer appears in search results or in the user's list of contributed prices. This action is permanent and requires user authentication to confirm their identity. The operation enhances data control by enabling users to manage and curate their submitted pricing information.",
      requestBody: {
        description: "No request body is required for this operation.",
        content: {}
      },
      responses: {
        "204": {
          description: "The price was deleted successfully."
        }
      }
    }
  }
};
