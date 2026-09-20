import type { PerfilUsuario } from "../types/auth";
import type { Usuario, CriarUsuario } from "../types/usuario";
import { api } from "./api";

export async function listarPorPerfil(
  perfil: PerfilUsuario
): Promise<Usuario[]> {

  const response = await api.get<Usuario[]>(
    `/usuarios/listarUsuariosPerfil?perfil=${perfil}`
  );

  return response.data;
}

export async function cadastrarUsuario(dados: CriarUsuario): Promise<Usuario> {

  const response = await api.post<Usuario>("/usuarios/cadastrarUsuario", dados);

  return response.data;

}