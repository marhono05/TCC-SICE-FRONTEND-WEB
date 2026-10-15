import type { PerfilUsuario } from "../schemas/perfilUsuarioSchema";

export type Usuario = {
    id: number;
    nome: string;
    email: string;
    perfil: PerfilUsuario;
    turmasIds: number[];
    identificador: string;
    ativo: boolean;
}

export type CriarUsuario = {
    identificador: string;
    nome: string;
    email: string;
    perfil: PerfilUsuario;
    turmasIds: number[];
}

export type EditarUsuario = {
    identificador: string;
    nome: string;
    email: string;
    turmasIds: number[];
}