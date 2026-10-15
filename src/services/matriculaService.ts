import { api } from "./api";
import type { Matricula, MatriculaDaTurma } from "../types/matricula";

export async function listarMatriculasAluno(usuarioId: number): Promise<Matricula[]> {
    const { data } = await api.get<Matricula[]>(`/usuarios/${usuarioId}/matriculas`);
    return data;
}

export async function adicionarMatriculaAluno(usuarioId: number, turmaId: number): Promise<Matricula> {
    const { data } = await api.post<Matricula>(`/usuarios/${usuarioId}/matriculas`, { turmaId });
    return data;
}

export async function alterarStatusMatriculaAluno(
    usuarioId: number, matriculaId: number, ativo: boolean
): Promise<Matricula> {
    const { data } = await api.patch<Matricula>(
        `/usuarios/${usuarioId}/matriculas/${matriculaId}/status`, { ativo }
    );
    return data;
}

/** Matrículas da turma (ativas e inativas); somente ADMIN. */
export async function listarMatriculasTurma(turmaId: number): Promise<MatriculaDaTurma[]> {
    const { data } = await api.get<MatriculaDaTurma[]>(`/turmas/${turmaId}/matriculas`);
    return data;
}
