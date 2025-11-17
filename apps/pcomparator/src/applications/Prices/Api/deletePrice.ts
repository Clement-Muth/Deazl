"use server";

import { pcomparatorAuthenticatedApiClient } from "@deazl/system";
import { z } from "zod";
import { auth } from "~/libraries/nextauth/authConfig";
import { HTTPError } from "~/types/error";

const ParamsSchema = z.object({
  priceId: z.string(),
  userId: z.string()
});

const ParamsPayload = ParamsSchema.omit({ userId: true });

export const deletePrice = async (params: z.infer<typeof ParamsPayload>): Promise<void> => {
  try {
    const session = await auth();
    const paramsPayload = ParamsSchema.parse({ userId: session?.user.id, ...params });

    await pcomparatorAuthenticatedApiClient.delete("/v1/user/{id}/prices/{priceId}", {
      params: { path: { id: paramsPayload.userId, priceId: paramsPayload.priceId } }
    });
  } catch (error) {
    if (error instanceof HTTPError) {
      switch (error.status) {
        case 404:
      }
      console.error("error message:", error);
    }

    throw error;
  }
};
