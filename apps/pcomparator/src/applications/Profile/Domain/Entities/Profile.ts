import { z } from "zod";

export const ProfileUpdateSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(25).optional(),
  phone: z.string().optional(),
  image: z.string().min(1).optional()
});

export type ProfileUpdate = z.infer<typeof ProfileUpdateSchema>;

export const ProfileSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(25),
  phone: z.string().nullable(),
  image: z.string()
});

export type Profile = z.infer<typeof ProfileSchema>;
