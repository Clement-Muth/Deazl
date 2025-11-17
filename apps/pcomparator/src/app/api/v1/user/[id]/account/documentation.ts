import { z } from "zod";
import { type ZodOpenApiPathsObject, extendZodWithOpenApi } from "zod-openapi";

extendZodWithOpenApi(z);

export const paths: ZodOpenApiPathsObject = {
  "/v1/user/{id}/account": {
    delete: {
      parameters: [
        {
          in: "path",
          description: "id of the user",
          name: "id",
          required: true,
          example: "1bc0956b-c517-4b91-a3ca-1ebea5c60440",
          schema: { type: "string" }
        }
      ],
      operationId: "deleteAccount",
      summary: "Delete user account.",
      description:
        "This operation permanently deletes the account associated with the specified user ID. This action is irreversible and removes all information linked to this account.",
      requestBody: {
        description: "No request body is required for this operation.",
        content: {}
      },
      responses: {
        "204": {
          description: "The account was deleted successfully."
        }
      }
    }
  }
};
