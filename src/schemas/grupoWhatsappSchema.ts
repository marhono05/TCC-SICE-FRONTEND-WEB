import { z } from "zod";

export const grupoWhatsappSchema = z
    .object({
        nome: z
            .string()
            .min(1, "O nome é obrigatório."),

        identificador: z
            .string()
            .min(1, "O identificador é obrigatório."),

        tipo: z.enum([
            "GERAL_ALUNOS",
            "GERAL_PROFESSORES",
            "TURMA",
        ]),

        turmaId: z
            .number()
            .nullable(),
    })
    .superRefine((dados, ctx) => {
        if (
            dados.tipo === "TURMA" &&
            dados.turmaId === null
        ) {
            ctx.addIssue({
                code: "custom",
                path: ["turmaId"],
                message: "Selecione uma turma.",
            });
        }

        if (
            dados.tipo !== "TURMA" &&
            dados.turmaId !== null
        ) {
            ctx.addIssue({
                code: "custom",
                path: ["turmaId"],
                message: "Grupos gerais não podem possuir uma turma.",
            });
        }
    });

export type GrupoWhatsappFormData =
    z.infer<typeof grupoWhatsappSchema>;