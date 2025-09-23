import { z } from "zod";

export const AllergySchema = z.object({
  userId: z.string().uuid(),
  values: z.object({
    allergyId: z.string().uuid(),
  }),
});

export type AllergySchemaType = z.infer<typeof AllergySchema>;
