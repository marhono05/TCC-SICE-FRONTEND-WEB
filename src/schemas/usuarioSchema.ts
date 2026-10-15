import { z } from "zod";
import { perfilUsuarioSchema } from "./perfilUsuarioSchema";

const camposUsuario = z.object({
    identificador: z.string().trim().min(1, "O identificador é obrigatório!"),
    nome: z.string().trim().min(1, "O nome é obrigatório!").max(100, "O nome pode ter no máximo 100 caracteres!"),
    email: z.string().trim().min(1, "O e-mail é obrigatório!").email("Digite um e-mail válido!"),
    perfil: perfilUsuarioSchema,
    turmasIds: z.array(z.number()),
});

function validarTurmas(dados: z.infer<typeof camposUsuario>, ctx: z.RefinementCtx, cadastroInicial: boolean) {
    
    if (cadastroInicial && dados.perfil === "ALUNO" && dados.turmasIds.length === 0) {
        ctx.addIssue({
            code: "custom",
            path: ["turmasIds"],
            message: "Selecione pelo menos uma turma para o aluno.",
        });
    }

    if (dados.perfil !== "ALUNO" && dados.turmasIds.length > 0) {
        ctx.addIssue({
            code: "custom",
            path: ["turmasIds"],
            message: "Apenas alunos podem possuir turmas.",
        });
    }
}

export const usuarioSchema = camposUsuario.superRefine((dados, ctx) => validarTurmas(dados, ctx, true));

export const usuarioEdicaoSchema = camposUsuario.superRefine((dados, ctx) => validarTurmas(dados, ctx, false));

export type UsuarioFormData = z.infer<typeof camposUsuario>;
