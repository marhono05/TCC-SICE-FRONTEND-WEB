import { z } from "zod";

export const etapaSchema = z.enum([
    "PRIMEIRA",
    "SEGUNDA",
    "TERCEIRA"
]);

export type Etapa =
    z.infer<typeof etapaSchema>;


export const modalidadeSchema = z.enum([
    "MEDIO",
    "TECNICO"
]);

export type ModalidadeEnsino =
    z.infer<typeof modalidadeSchema>;