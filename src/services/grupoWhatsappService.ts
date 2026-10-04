import type {
    CriarGrupoWhatsapp,
    EditarGrupoWhatsapp,
    GrupoWhatsapp
} from "../types/grupoWhatsapp";

import { api } from "./api";

export async function buscarGrupoPorId(
    id: number
): Promise<GrupoWhatsapp> {

    const response = await api.get<GrupoWhatsapp>(
        `/grupos-whatsapp/${id}`
    );

    return response.data;
}

export async function listarTodos(): Promise<GrupoWhatsapp[]> {

    const response = await api.get<GrupoWhatsapp[]>(
        "/grupos-whatsapp/listarGrupos"
    );

    return response.data;
}

export async function cadastrarGrupo(
    dados: CriarGrupoWhatsapp
): Promise<GrupoWhatsapp> {

    const response = await api.post<GrupoWhatsapp>(
        "/grupos-whatsapp/cadastrarGrupo",
        dados
    );

    return response.data;
}

export async function editarGrupo(
    id: number,
    dados: EditarGrupoWhatsapp
): Promise<GrupoWhatsapp> {

    const response = await api.put<GrupoWhatsapp>(
        `/grupos-whatsapp/${id}`,
        dados
    );

    return response.data;
}

export async function alterarStatusGrupo(
    id: number,
    ativo: boolean
): Promise<void> {

    await api.patch(
        `/grupos-whatsapp/${id}/status`,
        { ativo }
    );
}