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
    perfil: PerfilUsuario;
    primeiroAcesso: boolean;
};