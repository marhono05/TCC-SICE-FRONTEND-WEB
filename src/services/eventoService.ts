import type { Evento } from "../types/evento";
import { api } from "./api";

async function buscarTodos():Promise<Evento[]> {
    const response = await api.get<Evento[]>("/eventos/listarEventos");
    return response.data;
}

async function buscarMeusEventos():Promise<Evento[]> {
    const response = await api.get<Evento[]>("/eventos/listarEventosPerfil");
    return response.data;
}

export const eventoService = {
    buscarTodos,
    buscarMeusEventos
}