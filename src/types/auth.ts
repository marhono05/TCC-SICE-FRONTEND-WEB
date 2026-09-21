import type { PerfilUsuario } from "../schemas/perfilUsuarioSchema";

export type LoginRequest = {
    identificador: string;
    senha: string;
};

export type LoginResponse = {
    perfil: PerfilUsuario;
    primeiroAcesso: boolean;
};