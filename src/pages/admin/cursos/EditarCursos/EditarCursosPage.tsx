import { useEffect, useState } from "react";
import { useParams } from "react-router";

import FormCurso from "../../../../components/FormCurso";

import {
    buscarCursoPorId,
    editarCurso
} from "../../../../services/cursoService";

import type {
    Curso,
    EditarCurso
} from "../../../../types/curso";

import type {
    CursoFormData
} from "../../../../schemas/cursoSchema";


export default function EditarCursosPage() {

    const { id } = useParams();

    const [curso, setCurso] =
        useState<Curso | null>(null);


    useEffect(() => {

        async function buscarCurso() {

            if (!id) {
                return;
            }

            try {

                const cursoEncontrado =
                    await buscarCursoPorId(
                        Number(id)
                    );

                setCurso(cursoEncontrado);

            } catch (error) {

                console.log(
                    "Erro ao buscar curso"
                );

                console.log(error);

            }
        }

        buscarCurso();

    }, [id]);


    async function editar(
        dados: CursoFormData
    ) {

        if (!curso) {
            return;
        }

        const cursoEditado: EditarCurso = {
            nome: dados.nome
        };

        try {

            const cursoAtualizado =
                await editarCurso(
                    curso.id,
                    cursoEditado
                );

            setCurso(cursoAtualizado);

        } catch (error) {

            console.log(
                "Erro ao editar curso"
            );

            console.log(error);

        }
    }


    if (!curso) {

        return (
            <p>
                Carregando...
            </p>
        );

    }


    return (

        <div>

            <h1>
                Editar Curso
            </h1>

            <FormCurso
                curso={curso}
                onSubmit={editar}
            />

        </div>

    );
}