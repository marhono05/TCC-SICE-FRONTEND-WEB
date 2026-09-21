import { z } from "zod";

export const cursoSchema = z.object({
    nome: z
        .string()
        .trim()
        .min(1, "O nome do curso é obrigatório!")
        .max(100, "O nome do curso pode ter no máximo 100 caracteres!")
});

export type CursoFormData =
    z.infer<typeof cursoSchema>;