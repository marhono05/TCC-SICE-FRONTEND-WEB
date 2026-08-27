export type PerfilUsuario =
    | "ALUNO"
    | "PROFESSOR"
    | "SECRETARIA"
    | "ADMIN";

export type LoginRequest = {
    identificador: string;
    senha: string;
};

export type LoginResponse = {
    token: string;
    tipo: string;
    perfil: PerfilUsuario;
    primeiroAcesso: boolean;
};