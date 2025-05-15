import { z } from "zod";

const gender = z.enum(['male', 'female'])
const role = z.enum(['patient', 'doctor', 'owner'])
const bloodType = z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'])

export const RegisterPatientSchema = z.object({
    firstName: z.string().min(5),
    lastName: z.string().min(5),
    gender: gender,
    NID: z.string().min(13).max(13),
    password: z.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/),
    role: role,
    // birth_date: z.date(),
    blood_type: bloodType,
});
