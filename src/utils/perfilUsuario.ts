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
