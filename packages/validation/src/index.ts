// Shared Zod schemas for forms that exist on both web and mobile. Rules match
// the validation already enforced by the web app's forms (see
// src/components/auth/AuthForm.tsx and src/components/lists/CreateListForm.tsx)
// — this package doesn't change web behavior, it gives the new mobile forms
// the same rules instead of re-deriving them.
import { z } from "zod";

export const emailSchema = z
  .string()
  .trim()
  .min(1, "Email is required.")
  .email("Enter a valid email address.");

export const passwordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters.");

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required."),
});
export type SignInInput = z.infer<typeof signInSchema>;

export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  displayName: z.string().trim().optional(),
});
export type SignUpInput = z.infer<typeof signUpSchema>;

export const createListSchema = z.object({
  name: z.string().trim().min(1, "Give your list a name."),
  budget: z
    .number()
    .positive("Budget must be greater than 0.")
    .optional(),
  storeId: z.string().optional(),
  notes: z.string().trim().optional(),
});
export type CreateListInput = z.infer<typeof createListSchema>;

export const itemEntrySchema = z.object({
  rawText: z.string().trim().min(1, "Enter an item name."),
  quantity: z.number().int().min(1).default(1),
  notes: z.string().trim().optional(),
  priority: z.enum(["low", "normal", "high"]).default("normal"),
});
export type ItemEntryInput = z.infer<typeof itemEntrySchema>;

export const bulkItemEntrySchema = z.object({
  text: z.string().trim().min(1, "Add at least one item."),
});
export type BulkItemEntryInput = z.infer<typeof bulkItemEntrySchema>;

export const zipSearchSchema = z.object({
  zip: z
    .string()
    .trim()
    .regex(/^\d{5}$/, "Enter a 5-digit ZIP code."),
});
export type ZipSearchInput = z.infer<typeof zipSearchSchema>;
