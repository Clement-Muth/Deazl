import { z } from "zod";
import { type ZodOpenApiPathsObject, extendZodWithOpenApi } from "zod-openapi";

extendZodWithOpenApi(z);

export const paths: ZodOpenApiPathsObject = {
  "/v1/user/{id}/profile/avatar": {
    patch: {
      operationId: " updateUserAvatar",
      summary: "Update User Avatar",
      description:
        "This operation updates the avatar of the user identified by the specified user ID. Users can upload a new avatar image file to update their profile picture.",
      parameters: [
        {
          in: "path",
          description: "id of the user",
          name: "id",
          required: true,
          schema: { type: "string" }
        },
        {
          in: "query",
          description: "",
          name: "filename",
          required: true,
          schema: { type: "string" }
        }
      ],
      requestBody: {
        description: "The avatar image to upload. This should be a file object representing the new avatar.",
        content: {
          "multipart/form-data": {
            schema: {}
          }
        }
      },
      responses: {
        200: {
          description: "Avatar updated successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  image: {
                    type: "string",
                    format: "uri",
                    example: "https://pcomparator.vercel.app/avatars/new-avatar.png"
                  }
                },
                required: ["image"]
              }
            }
          }
        }
      }
    }
  }
};
