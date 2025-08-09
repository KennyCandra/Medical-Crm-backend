import { z } from "zod";

export const PrescriptionSchema = z.object({
    description: z.string().min(1),
    patient: z.string().min(1),
    doctor: z.string().min(1),
    medication: z.array(z.object({
        id: z.string().min(1),
        dose: z.string().min(1),
        frequency: z.string().min(1),
        time: z.string().min(1),
    })),
})

export type PrescriptionSchemaType = z.infer<typeof PrescriptionSchema>;