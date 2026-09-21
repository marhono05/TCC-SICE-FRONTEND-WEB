import type { PerfilUsuario } from "../schemas/perfilUsuarioSchema";
import type { Usuario, CriarUsuario, EditarUsuario } from "../types/usuario";
import { api } from "./api";

export async function buscarUsuarioPorId(id: number) {
  const response = await api.get(`/usuarios/${id}`);

  return response.data;
}

export async function listarPorPerfil(perfil: PerfilUsuario): Promise<Usuario[]> {

  const response = await api.get<Usuario[]>(
    `/usuarios/listarUsuariosPerfil?perfil=${perfil}`
  );

  return response.data;
}

export async function cadastrarUsuario(dados: CriarUsuario): Promise<Usuario> {

  const response = await api.post<Usuario>("/usuarios/cadastrarUsuario", dados);

  return response.data;

}

export async function editarUsuario(id: number, dados: EditarUsuario): Promise<Usuario> {
  const response = await api.put<Usuario>(`/usuarios/${id}`, dados);

  return response.data;
}

export async function desativarUsuario(id: number): Promise<void> {
  await api.patch(`/usuarios/${id}/desativar`);

}

export async function ativarUsuario(id: number): Promise<void> {
  await api.patch(`/usuarios/${id}/ativar`);

}

export async function alterarStatusUsuario(id: number, ativo: boolean) {
    const response = await api.patch(`/usuarios/${id}/status`, {ativo})

    return response.data;
}