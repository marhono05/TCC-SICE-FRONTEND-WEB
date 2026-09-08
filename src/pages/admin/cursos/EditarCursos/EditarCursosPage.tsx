import { useEffect, useState } from "react";
import type { Curso, CriarCurso } from "../../../../types/curso";
import { buscarCursoPorId, editarCurso } from "../../../../services/cursoService";
import FormCurso from "../../../../components/FormCurso";
import { useParams } from "react-router";

export default function EditarCursosPage() {

    const { id } = useParams();

    const [curso, setCurso] = useState<Curso | null>(null);

    useEffect(() => {

        async function buscarCurso() {

            if (!id) return;

            try {

                const cursoEncontrado = await buscarCursoPorId(Number(id));

                setCurso(cursoEncontrado);

            } catch (error) {

                console.log("Erro ao buscar curso");
                console.log(error);

            }
        }

        buscarCurso();

    }, [id]);


    async function editar(dados: CriarCurso) {

        if (!curso) return;

        try {

            await editarCurso(curso.id, dados);

        } catch (error) {

            console.log("Erro ao editar curso");
            console.log(error);

        }
    }


    if (!curso) {
        return <p>Carregando...</p>;
    }


    return (
        <div>
            <h1>Editar Curso</h1>

            <FormCurso
                curso={curso}
                onSubmit={editar}
            />
        </div>
    );
}