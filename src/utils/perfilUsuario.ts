import type { PerfilUsuario } from "../types/auth";

export const PERFIS_USUARIO: PerfilUsuario[] = [
    "ALUNO",
    "PROFESSOR",
    "SECRETARIA",
    "ADMIN"
];

export function isPerfilUsuario(valor: string): valor is PerfilUsuario {
    return PERFIS_USUARIO.includes(valor as PerfilUsuario);
}

export const PERFIL_LABEL_SINGULAR: Record<PerfilUsuario, string> = {
    ALUNO: "Aluno",
    PROFESSOR: "Professor",
    SECRETARIA: "Secretaria",
    ADMIN: "Administrador",
};

export const PERFIL_LABEL_PLURAL: Record<PerfilUsuario, string> = {
    ALUNO: "Alunos",
    PROFESSOR: "Professores",
    SECRETARIA: "Secretaria",
    ADMIN: "Administradores",
};