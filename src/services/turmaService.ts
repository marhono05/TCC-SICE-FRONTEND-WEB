import { api } from "./api";
import type { CriarTurma, Turma } from "../types/turmas";

export async function listarTurma():Promise<Turma[]> {
    const response = await api.get<Turma[]>("/turmas/listarTurmas");
    
    return response.data;
}

export async function cadastrarTurma(dados: CriarTurma): Promise<CriarTurma> {
    const response = await api.post<Turma>("turmas/cadastrarTurma", dados);

    return response.data;
}

export const turmaService = {
    listarTurma,
    cadastrarTurma
}