import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Saisissez une adresse e-mail valide."),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caracteres."),
});

export const registerSchema = loginSchema.extend({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caracteres."),
});

export const registerUserSchema = registerSchema;

export const profileSchema = z.object({
  city: z.string().trim().min(2, "La ville est requise."),
  age: z.coerce.number().int().min(1, "L'age doit etre valide.").max(120, "L'age doit etre valide."),
  gender: z.enum(["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"]),
  bio: z.string().trim().max(500, "La bio ne peut pas depasser 500 caracteres.").optional().or(z.literal("")),
  availability: z
    .string()
    .trim()
    .max(120, "La disponibilite ne peut pas depasser 120 caracteres.")
    .optional()
    .or(z.literal("")),
});

export const userSportLevelSchema = z.enum([
  "BEGINNER",
  "INTERMEDIATE",
  "ADVANCED",
  "EXPERT",
]);

export const addUserSportSchema = z.object({
  sportId: z.string().min(1, "Sport invalide."),
  level: userSportLevelSchema,
});

export const uploadProfileImageSchema = z.object({
  file: z.instanceof(File, { message: "Fichier invalide." }),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type UserSportLevel = z.infer<typeof userSportLevelSchema>;
