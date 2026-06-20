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
  age: z.number().int().min(1, "L'age doit etre valide.").max(120, "L'age doit etre valide."),
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

export const postTypeSchema = z.enum(["TEAM_LOOKING_PLAYER", "PLAYER_LOOKING_TEAM"]);

export const postSortSchema = z.enum(["recent", "matchDate", "popular"]);

export const postSchema = z.object({
  title: z.string().trim().min(3, "Le titre doit contenir au moins 3 caracteres."),
  description: z
    .string()
    .trim()
    .min(20, "La description doit contenir au moins 20 caracteres."),
  city: z.string().trim().min(2, "La ville est requise."),
  sportId: z.string().min(1, "Le sport est requis."),
  matchDate: z.iso.date("La date du match est invalide."),
  matchTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "L'heure est invalide."),
  requiredLevel: userSportLevelSchema,
  playersNeeded: z
    .number()
    .int("Le nombre de places doit etre un entier.")
    .min(1, "Il faut au moins 1 place.")
    .max(100, "Le nombre de places est trop eleve."),
  type: postTypeSchema,
});

export const postsFiltersSchema = z.object({
  sport: z.string().optional(),
  city: z.string().optional(),
  level: userSportLevelSchema.optional(),
  date: z.iso.date().optional(),
  type: postTypeSchema.optional(),
  sort: postSortSchema.optional(),
});

export const uploadProfileImageSchema = z.object({
  file: z.instanceof(File, { message: "Fichier invalide." }),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type UserSportLevel = z.infer<typeof userSportLevelSchema>;
export type PostInput = z.infer<typeof postSchema>;
export type PostFiltersInput = z.infer<typeof postsFiltersSchema>;
export type PostSort = z.infer<typeof postSortSchema>;
