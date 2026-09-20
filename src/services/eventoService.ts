import type { CriarEvento, EditarEvento, Evento } from "../types/evento";
import { api } from "./api";

export async function buscarEventoPorId(id: number) {
    const response = await api.get(`/eventos/${id}`);

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

export async function reativarEvento(id: number): Promise<Evento> {
    const response = await api.patch<Evento>(`/eventos/${id}/reativar`);

    return response.data;
}