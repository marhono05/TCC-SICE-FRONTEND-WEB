export type ModalidadeEnsino = 
    | "MEDIO"
    | "TECNICO";


export type Turma = {
    id: number;
    anoLetivo: number;
    etapa: string;
    modalidade: ModalidadeEnsino;
    cursoId: number;
    cursoNome: string;
    ativo: boolean;
}

export type CriarTurma = {
    anoLetivo: number;
    etapa: string;
    modalidade: ModalidadeEnsino;
    cursoId: number;
}