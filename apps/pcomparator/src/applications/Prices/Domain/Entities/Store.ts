import { z } from "zod";

export const StoreSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  location: z.string().min(1),
  websiteUrl: z.string().url().nullable().optional()
});

export const CreateStoreSchema = StoreSchema.omit({
  id: true
});

export type Store = z.infer<typeof StoreSchema>;
export type CreateStore = z.infer<typeof CreateStoreSchema>;
