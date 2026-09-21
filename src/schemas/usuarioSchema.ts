import { z } from "zod";
import { perfilUsuarioSchema } from "./perfilUsuarioSchema";

export const usuarioSchema = z
    .object({
        identificador: z
            .string()
            .trim()
            .min(1, "O identificador é obrigatório!"),

        nome: z
            .string()
            .trim()
            .min(1, "O nome é obrigatório!")
            .max(100, "O nome pode ter no máximo 100 caracteres!"),

        email: z
            .string()
            .trim()
            .min(1, "O e-mail é obrigatório!")
            .email("Digite um e-mail válido!"),

        perfil: perfilUsuarioSchema,

        turmasIds: z.array(z.number())
    })
    .superRefine((dados, ctx) => {

        if (
            dados.perfil === "ALUNO" &&
            dados.turmasIds.length === 0
        ) {
            ctx.addIssue({
                code: "custom",
                path: ["turmasIds"],
                message: "Selecione pelo menos uma turma para o aluno."
            });
        }

        if (
            dados.perfil !== "ALUNO" &&
            dados.turmasIds.length > 0
        ) {
            ctx.addIssue({
                code: "custom",
                path: ["turmasIds"],
                message: "Apenas alunos podem possuir turmas."
            });
        }
    });

export type UsuarioFormData =
    z.infer<typeof usuarioSchema>;