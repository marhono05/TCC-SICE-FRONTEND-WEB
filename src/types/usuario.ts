import type { PerfilUsuario } from "./auth";

export type Usuario = {
    id: number;
    nome: string;
    email: string;
    perfil: PerfilUsuario;
    turmasIds: number[];
    identificador: string;
}