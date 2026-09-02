export type ModalidadeEnsino = 
    | "MEDIO"
    | "TECNICO";

export type Curso = {
    id: number;
    nome: string;
    modalidade: ModalidadeEnsino;
}

export type CriarCurso = {
    nome: string;
    modalidade: ModalidadeEnsino;
}