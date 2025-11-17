import { z } from "zod";
import { type ZodOpenApiPathsObject, extendZodWithOpenApi } from "zod-openapi";
import { ParamsSchema } from "~/app/api/v1/user/[id]/profile/route";
import { ProfileSchema } from "~/applications/Profile/Domain/Entities/Profile";

extendZodWithOpenApi(z);

const ExtendedParamsSchema = ParamsSchema.extend({
  storeName: ParamsSchema.shape.name.openapi({
    default: "Clément Muth",
    example: "Clément Muth",
    description: "Name of the user"
  }),
  phone: ParamsSchema.shape.phone.openapi({
    default: "+33666666666",
    example: "+33666666666",
    description: "Phone number of the user"
  })
});

const ExtendedProfileSchema = ProfileSchema.extend({
  id: ProfileSchema.shape.id.openapi({ example: "010f21e3-c5b9-4d91-a5b1-b713d2324b17" }),
  image: ProfileSchema.shape.image.openapi({ example: "https://pcomparator/images" }),
  name: ProfileSchema.shape.name.openapi({ example: "Clément Muth" }),
  phone: ProfileSchema.shape.phone.openapi({ example: "+33666666666" })
});

export const paths: ZodOpenApiPathsObject = {
  "/v1/user/{id}/profile": {
    patch: {
      operationId: "updateUserProfile",
      summary: "Update User Profile",
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
      description:
        "This operation updates the profile information of the user identified by the specified user ID. Users can update their profile details such as name, phone, and other relevant information.",
      requestBody: {
        description: "The profile data to update. This should include the fields that need to be modified.",
        content: {
          "application/json": {
            schema: ExtendedParamsSchema,
            example: {
              phone: "+33666666666",
              name: "Clément Muth"
            }
          }
        }
      },
      responses: {
        200: {
          description: "Profile updated successfully.",
          content: {
            "application/json": {
              schema: ExtendedProfileSchema
            }
          }
        }
      }
    }
  }
};
