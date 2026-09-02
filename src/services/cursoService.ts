import type { CriarCurso, Curso } from "../types/curso";
import { api } from "./api";

export async function listarCurso():Promise<Curso[]> {
    const response = await api.get<Curso[]>("/cursos/listarCursos");

    return response.data;
}

export async function cadastrarCurso(dados: CriarCurso):Promise<Curso> {
    const response = await api.post<Curso>("/cursos/cadastrarCurso", dados);

    return response.data;
}

export const cursoService = {
    listarCurso,
    cadastrarCurso
};