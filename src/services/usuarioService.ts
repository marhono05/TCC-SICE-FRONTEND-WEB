import type { PerfilUsuario } from "../types/auth";
import type { Usuario } from "../types/usuario";
import { api } from "./api";

async function listarPorPerfil(
  perfil: PerfilUsuario
): Promise<Usuario[]> {

  const response = await api.get<Usuario[]>(
    `/usuarios/listarUsuariosPerfil?perfil=${perfil}`
  );

  return response.data;
}

export const usuarioService = {
    listarPorPerfil
}