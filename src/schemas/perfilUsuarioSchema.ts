import z from "zod";

export const perfilUsuarioSchema = z.enum([
    "ALUNO",
    "PROFESSOR",
    "ADMIN",
    "SECRETARIA"
]);

export type PerfilUsuario = z.infer<typeof perfilUsuarioSchema>;