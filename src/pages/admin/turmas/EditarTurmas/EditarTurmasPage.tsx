import { useEffect, useState } from "react";
import { useParams } from "react-router";

import FormTurma from "../../../../components/FormTurma";

import {
    buscarTurmaPorId,
    editarTurma
} from "../../../../services/turmaService";

import {
    listarCurso
} from "../../../../services/cursoService";

import type {
    Turma,
    EditarTurma
} from "../../../../types/turmas";

import type {
    Curso
} from "../../../../types/curso";

import type {
    TurmaFormData
} from "../../../../schemas/turmaSchemas";


export default function EditarTurmasPage() {

    const { id } = useParams();

    const [turma, setTurma] =
        useState<Turma | null>(null);

    const [cursos, setCursos] =
        useState<Curso[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [salvando, setSalvando] =
        useState(false);


    useEffect(() => {

        async function carregarDados() {

            if (!id) {
                return;
            }

            try {

                setLoading(true);

                const [
                    turmaEncontrada,
                    cursosEncontrados
                ] = await Promise.all([
                    buscarTurmaPorId(Number(id)),
                    listarCurso()
                ]);

                setTurma(turmaEncontrada);
                setCursos(cursosEncontrados);

            } catch (error) {

                console.log(
                    "Erro ao carregar turma"
                );

                console.log(error);

            } finally {

                setLoading(false);

            }
        }


        carregarDados();

    }, [id]);


    async function editar(
        dados: TurmaFormData
    ) {

        if (!turma) {
            return;
        }


        const turmaEditada: EditarTurma = {
            anoLetivo: dados.anoLetivo,
            etapa: dados.etapa,
            modalidade: dados.modalidade,
            cursoId: dados.cursoId
        };


        try {

            setSalvando(true);

            const turmaAtualizada =
                await editarTurma(
                    turma.id,
                    turmaEditada
                );

            setTurma(turmaAtualizada);

        } catch (error) {

            console.log(
                "Erro ao editar turma"
            );

            console.log(error);

        } finally {

            setSalvando(false);

        }
    }


    if (loading) {

        return (
            <p>
                Carregando...
            </p>
        );

    }


    if (!turma) {

        return (
            <p>
                Turma não encontrada.
            </p>
        );

    }


    return (

        <div>

            <h1>
                Editar Turma
            </h1>


            <FormTurma
                turma={turma}
                cursos={cursos}
                onSubmit={editar}
            />


            {salvando && (
                <p>
                    Salvando alterações...
                </p>
            )}

        </div>

    );
}