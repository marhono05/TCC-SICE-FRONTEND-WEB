import type { CriarEvento, EditarEvento, Evento, CriarEventoDestino, VerificacaoGruposEvento } from "../types/evento";
import { api } from "./api";

export async function buscarEventoPorId(id: number): Promise<Evento> {
    const response = await api.get<Evento>(`/eventos/${id}`);

    return response.data;
}

export async function listarTodos(): Promise<Evento[]> {
    const response = await api.get<Evento[]>("/eventos/listarEventos");

    return response.data;
}

export async function listarMeusEventos(): Promise<Evento[]> {
    const response = await api.get<Evento[]>("/eventos/listarEventosPerfil");

    return response.data;
}

export async function cadastrarEvento(dados: CriarEvento): Promise<Evento> {
    const response = await api.post<Evento>("/eventos/cadastrarEvento", dados);

    return response.data;
}

export async function editarEvento(id: number, dados: EditarEvento): Promise<Evento> {
    const response = await api.put<Evento>(`/eventos/${id}`, dados);

    return response.data;
}

export async function cancelarEvento(id: number): Promise<Evento> {
    const response = await api.patch<Evento>(`/eventos/${id}/cancelar`);

    return response.data;
}

/** O backend recusa a exclusao quando existe qualquer EnvioAviso ou comunicacao. */
export async function excluirEvento(id: number): Promise<void> {
    await api.delete(`/eventos/${id}`);
}

/** Consulta informativa: nao cadastra evento nem envia mensagens. */
export async function verificarGruposDoEvento(destinos: CriarEventoDestino[]): Promise<VerificacaoGruposEvento> {
    const response = await api.post<VerificacaoGruposEvento>("/eventos/verificarGrupos", { destinos });
    return response.data;
}
