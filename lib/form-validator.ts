import { z } from "zod";

export const CategorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
  slug: z.string().min(2, "Slug is required"),
  image: z.string().url("Please enter a valid image URL").or(z.literal("")),
});

export type CategoryInput = z.infer<typeof CategorySchema>;