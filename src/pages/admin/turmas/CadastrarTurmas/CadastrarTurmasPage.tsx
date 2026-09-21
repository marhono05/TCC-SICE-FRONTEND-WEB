import { useEffect, useState } from "react";

import FormTurma from "../../../../components/FormTurma";

import { listarCurso } from "../../../../services/cursoService";
import { cadastrarTurma } from "../../../../services/turmaService";

import type { Curso } from "../../../../types/curso";
import type { CriarTurma } from "../../../../types/turmas";

import type {
    TurmaFormData
} from "../../../../schemas/turmaSchemas";


export default function CadastrarTurmasPage() {

    const [cursos, setCursos] =
        useState<Curso[]>([]);

    const [loading, setLoading] =
        useState(true);


    useEffect(() => {

        async function carregarCursos() {

            try {

                setLoading(true);

                const dados =
                    await listarCurso();

                setCursos(dados);

            } catch (error) {

                console.log(
                    "Erro ao carregar cursos"
                );

                console.log(error);

            } finally {

                setLoading(false);

            }
        }


        carregarCursos();

    }, []);


    async function cadastrar(
        dados: TurmaFormData
    ) {

        const novaTurma: CriarTurma = {
            anoLetivo: dados.anoLetivo,
            etapa: dados.etapa,
            modalidade: dados.modalidade,
            cursoId: dados.cursoId
        };


        try {

            const turma =
                await cadastrarTurma(
                    novaTurma
                );

            console.log(
                "Turma cadastrada:",
                turma
            );

        } catch (error) {

            console.log(
                "Erro ao cadastrar turma"
            );

            console.log(error);

        }
    }


    if (loading) {

        return (
            <p>
                Carregando cursos...
            </p>
        );

    }


    return (

        <div>

            <h2>
                Cadastrar Turma
            </h2>

            <FormTurma
                cursos={cursos}
                onSubmit={cadastrar}
            />

        </div>

    );
}