import { api } from "./api";
import type { CriarTurma, EditarTurma, Turma } from "../types/turmas";

export async function buscarTurmaPorId(id: number) {
    const response = await api.get(`/turmas/${id}`);

    return response.data;
}

export async function listarTurma():Promise<Turma[]> {
    const response = await api.get<Turma[]>("/turmas/listarTurmas");
    
    return response.data;
}

export async function cadastrarTurma(dados: CriarTurma): Promise<CriarTurma> {
    const response = await api.post<Turma>("turmas/cadastrarTurma", dados);

    return response.data;
}

export async function editarTurma(id: number, dados: EditarTurma): Promise<Turma> {
    const response = await api.put<Turma>(`/turmas/${id}`, dados);

    return response.data;
}

export async function alterarStatusTurma(id: number, ativo: boolean) {
    const response = await api.patch(`/turmas/${id}/status`, {ativo})

    return response.data;
}