export type TipoGrupo =
    | "GERAL_ALUNOS"
    | "GERAL_PROFESSORES"
    | "TURMA";

export interface GrupoWhatsapp {
    id: number;
    nome: string;
    identificador: string;
    tipo: TipoGrupo;
    turmaId: number | null;
    turmaDescricao: string | null;
    ativo: boolean;
}

export interface CriarGrupoWhatsapp {
    nome: string;
    identificador: string;
    tipo: TipoGrupo;
    turmaId: number | null;
}

export interface EditarGrupoWhatsapp {
    nome: string;
    identificador: string;
    tipo: TipoGrupo;
    turmaId: number | null;
}