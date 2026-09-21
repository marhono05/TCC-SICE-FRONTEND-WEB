import type {
    Etapa,
    ModalidadeEnsino
} from "../schemas/turmaSchemas";


export type Turma = {
    id: number;
    anoLetivo: number;
    etapa: Etapa;
    modalidade: ModalidadeEnsino;
    cursoId: number;
    cursoNome: string;
    ativo: boolean;
};


export type CriarTurma = {
    anoLetivo: number;
    etapa: Etapa;
    modalidade: ModalidadeEnsino;
    cursoId: number;
};


export type EditarTurma = {
    anoLetivo: number;
    etapa: Etapa;
    modalidade: ModalidadeEnsino;
    cursoId: number;
};