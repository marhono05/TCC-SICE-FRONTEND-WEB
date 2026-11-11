import type { PerfilUsuario } from "../schemas/perfilUsuarioSchema";

export type LoginRequest = {
    identificador: string;
    senha: string;
};

export type LoginResponse = {
    nome: string;
    perfil: PerfilUsuario;
    primeiroAcesso: boolean;
};