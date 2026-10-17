import type { PerfilDestinacao, StatusEvento } from "../schemas/eventoSchema";
import type { Etapa, ModalidadeEnsino } from "../schemas/turmaSchemas";

export type Evento = {
    id: number;
    titulo: string;
    descricao: string;
    dataInicio: string;
    horaInicio: string;
    dataAviso: string;
    status: StatusEvento;
    destinos: EventoDestino[];
    criadoPor: number;
    criadoPorNome: string;
};

export type EventoDestino = {
    id: number;
    perfil: PerfilDestinacao;
    etapas: Etapa[];
    modalidades: ModalidadeEnsino[];
    turmasIds: number[];
};

export type CriarEvento = {
    titulo: string;
    descricao: string;
    dataInicio: string;
    horaInicio: string;
    destinos: CriarEventoDestino[];
};

export type EditarEvento = {
    titulo: string;
    descricao: string;
    dataInicio: string;
    horaInicio: string;
    destinos: CriarEventoDestino[];
};

export type CriarEventoDestino = {
    perfil: PerfilDestinacao;
    etapas: Etapa[];
    modalidades: ModalidadeEnsino[];
    turmasIds: number[];
};

export type VerificacaoGruposEvento = {
    totalGruposAtivos: number;
    destinosSemGrupo: { perfil: PerfilDestinacao; turmaId: number | null }[];
};
