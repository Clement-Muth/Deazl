import { z } from "zod";

export const CreatePantryItemSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  quantity: z.number().positive("Quantity must be positive"),
  unit: z.string().min(1, "Unit is required"),
  expiration: z.string().optional().nullable(),
  location: z.string().optional().nullable()
});

export const UpdatePantryItemSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  quantity: z.number().positive().optional(),
  unit: z.string().min(1).optional(),
  expiration: z.string().optional().nullable(),
  location: z.string().optional().nullable()
});

export const PantryItemPayloadSchema = z.object({
  id: z.string(),
  userId: z.string(),
  productId: z.string().nullable(),
  name: z.string(),
  quantity: z.number(),
  unit: z.string(),
  expiration: z.date().nullable(),
  location: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  expirationStatus: z.enum(["expired", "expiring-soon", "fresh", "none"]).optional(),
  daysUntilExpiration: z.number().nullable().optional()
});

export type CreatePantryItemInput = z.infer<typeof CreatePantryItemSchema>;
export type UpdatePantryItemInput = z.infer<typeof UpdatePantryItemSchema>;
export type PantryItemPayload = z.infer<typeof PantryItemPayloadSchema>;
