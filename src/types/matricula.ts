import type { Etapa, ModalidadeEnsino } from "../schemas/turmaSchemas";

export type Matricula = {
    id: number;
    turmaId: number;
    cursoNome: string;
    anoLetivo: number;
    etapa: Etapa;
    modalidade: ModalidadeEnsino;
    ativo: boolean;
    turmaAtiva: boolean;
    cursoAtivo: boolean;
};

export type MatriculaDaTurma = {
    id: number;
    usuarioId: number;
    nome: string;
    email: string | null;
    identificador: string;
    usuarioAtivo: boolean;
    ativo: boolean;
};
