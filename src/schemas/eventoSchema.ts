import { z } from "zod";
import {
    etapaSchema,
    modalidadeSchema
} from "./turmaSchemas";

export const perfilDestinacaoSchema = z.enum([
    "ALUNO",
    "PROFESSOR"
]);

export const statusEventoSchema = z.enum([
    "ATIVO",
    "CANCELADO"
]);

export type PerfilDestinacao =
    z.infer<typeof perfilDestinacaoSchema>;

export type StatusEvento =
    z.infer<typeof statusEventoSchema>;

export const eventoDestinoSchema = z.object({
    perfil: perfilDestinacaoSchema,

    etapas: z.array(etapaSchema),

    modalidades: z.array(modalidadeSchema),

    turmasIds: z.array(z.number())
});

export const eventoSchema = z.object({
    titulo: z
        .string()
        .trim()
        .min(1, "O título é obrigatório!")
        .max(100, "O título pode ter no máximo 100 caracteres!"),

    descricao: z
        .string()
        .trim()
        .min(1, "A descrição é obrigatória!"),

    dataInicio: z
        .string()
        .min(1, "A data de início é obrigatória!"),

    horaInicio: z
        .string()
        .min(1, "A hora de início é obrigatória!"),

    destinos: z
        .array(eventoDestinoSchema)
        .min(1, "Selecione pelo menos um destino!")
});

export type EventoFormData =
    z.infer<typeof eventoSchema>;