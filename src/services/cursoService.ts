import type { CriarCurso, Curso, EditarCurso } from "../types/curso";
import { api } from "./api";

export async function buscarCursoPorId(id: number) {
    const response = await api.get(`/cursos/${id}`)

    return response.data;
}

export async function listarCurso():Promise<Curso[]> {
    const response = await api.get<Curso[]>("/cursos/listarCursos");

    return response.data;
}

export async function cadastrarCurso(dados: CriarCurso):Promise<Curso> {
    const response = await api.post<Curso>("/cursos/cadastrarCurso", dados);

    return response.data;
}

export async function editarCurso(id:number, dados: EditarCurso):Promise<Curso> {
    const response = await api.put<Curso>(`/cursos/${id}`, dados);

    return response.data;
}

export async function alterarStatusCurso(id: number, ativo: boolean) {
    const response = await api.patch(`/cursos/${id}/status`, {ativo})

    return response.data;
}
