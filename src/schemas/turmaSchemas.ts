import { z } from "zod";

export const etapaSchema = z.enum([
    "PRIMEIRA",
    "SEGUNDA",
    "TERCEIRA"
]);

export const modalidadeSchema = z.enum([
    "MEDIO",
    "TECNICO"
]);


export type Etapa =
    z.infer<typeof etapaSchema>;

export type ModalidadeEnsino =
    z.infer<typeof modalidadeSchema>;


export const turmaSchema = z.object({

    anoLetivo: z
        .number()
        .int("O ano letivo deve ser um número inteiro!")
        .min(2000, "Ano letivo inválido!"),

    etapa: etapaSchema,

    modalidade: modalidadeSchema,

    cursoId: z
        .number()
        .int()
        .positive("Selecione um curso!")
});


export type TurmaFormData =
    z.infer<typeof turmaSchema>;