import { z } from "zod";

const gender = z.enum(["male", "female"]);
const role = z.enum(["patient", "doctor"]);
const bloodType = z.enum([
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
  "unknown",
]);
export const RegisterPatientSchema = z.object({
  firstName: z.string().min(3),
  lastName: z.string().min(3),
  gender: gender,
  nid: z
    .string()
    .min(14)
    .max(14)
    .refine((val) => val.startsWith("2") || val.startsWith("3"), {
      message: "Password must start with 2 or 3",
    }),
  password: z.string().min(8),
  blood_type: bloodType,
  role: role,
  email: z.string().email(),
});

export const LoginSchema = z.object({
  nid: z.string().min(14).max(14),
  password: z.string().min(8),
});

export const resetTokenSchema = z.object({
  password: z.string().min(8),
  token: z.string().min(64).max(64, "Invalid token"),
});
