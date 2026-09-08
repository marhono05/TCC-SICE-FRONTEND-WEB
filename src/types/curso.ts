export type Curso = {
    id: number;
    nome: string;
    ativo: boolean;
}

export type CriarCurso = {
    nome: string;
}

export type EditarCurso = {
    nome: string;
}