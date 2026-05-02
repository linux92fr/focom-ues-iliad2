import { z } from "zod";

// Article validation schema
export const articleSchema = z.object({
  title: z.string()
    .trim()
    .min(1, "Le titre est requis")
    .max(200, "Le titre ne doit pas dépasser 200 caractères"),
  slug: z.string()
    .trim()
    .min(1, "Le slug est requis")
    .max(200, "Le slug ne doit pas dépasser 200 caractères")
    .regex(/^[a-z0-9-]+$/, "Le slug ne doit contenir que des lettres minuscules, chiffres et tirets"),
  excerpt: z.string()
    .max(500, "L'extrait ne doit pas dépasser 500 caractères")
    .optional()
    .nullable(),
  content: z.string()
    .trim()
    .min(1, "Le contenu est requis")
    .max(100000, "Le contenu ne doit pas dépasser 100 000 caractères"),
  cover_image: z.string()
    .regex(/^https?:\/\//, "L'URL doit commencer par http:// ou https://")
    .optional()
    .nullable()
    .or(z.literal("")),
  category_id: z.string().uuid().optional().nullable().or(z.literal("")),
  published: z.boolean(),
});

export type ArticleFormData = z.infer<typeof articleSchema>;

// News validation schema
export const newsSchema = z.object({
  title: z.string()
    .trim()
    .min(1, "Le titre est requis")
    .max(200, "Le titre ne doit pas dépasser 200 caractères"),
  content: z.string()
    .trim()
    .min(1, "Le contenu est requis")
    .max(100000, "Le contenu ne doit pas dépasser 100 000 caractères"),
  category_id: z.string().uuid().optional().nullable().or(z.literal("")),
  published: z.boolean(),
});

export type NewsFormData = z.infer<typeof newsSchema>;

// Profile validation schema
export const profileSchema = z.object({
  display_name: z.string()
    .trim()
    .max(100, "Le nom ne doit pas dépasser 100 caractères")
    .optional()
    .nullable()
    .or(z.literal("")),
  phone: z.string()
    .trim()
    .max(20, "Le téléphone ne doit pas dépasser 20 caractères")
    .regex(/^$|^[0-9\s\-+()]+$/, "Format de téléphone invalide")
    .optional()
    .nullable()
    .or(z.literal("")),
  section: z.string()
    .trim()
    .max(100, "La section ne doit pas dépasser 100 caractères")
    .optional()
    .nullable()
    .or(z.literal("")),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

// Category validation schema
export const categorySchema = z.object({
  name: z.string()
    .trim()
    .min(1, "Le nom est requis")
    .max(100, "Le nom ne doit pas dépasser 100 caractères"),
  slug: z.string()
    .trim()
    .min(1, "Le slug est requis")
    .max(100, "Le slug ne doit pas dépasser 100 caractères")
    .regex(/^[a-z0-9-]+$/, "Le slug ne doit contenir que des lettres minuscules, chiffres et tirets"),
  description: z.string()
    .max(500, "La description ne doit pas dépasser 500 caractères")
    .optional()
    .nullable()
    .or(z.literal("")),
  color: z.string()
    .regex(/^#[0-9a-fA-F]{6}$/, "La couleur doit être au format hexadécimal (#RRGGBB)")
    .optional()
    .nullable()
    .or(z.literal("")),
});

export type CategoryFormData = z.infer<typeof categorySchema>;

// Validation result types
export type ValidationSuccess<T> = { success: true; data: T };
export type ValidationError = { success: false; errors: Record<string, string> };
export type ValidationResult<T> = ValidationSuccess<T> | ValidationError;

// Validation helper function
export function validateFormData<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  const errors: Record<string, string> = {};
  result.error.errors.forEach((err) => {
    const path = err.path.join(".");
    if (!errors[path]) {
      errors[path] = err.message;
    }
  });
  
  return { success: false, errors };
}
