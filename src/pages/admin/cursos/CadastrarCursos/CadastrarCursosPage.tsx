import { cadastrarCurso } from "../../../../services/cursoService";
import FormCurso from "../../../../components/FormCurso";

import type {
    CursoFormData
} from "../../../../schemas/cursoSchema";


export default function CadastrarCursosPage() {

    async function cadastrar(
        dados: CursoFormData
    ) {

        try {

            const curso =
                await cadastrarCurso(dados);

            console.log(
                "Curso cadastrado:",
                curso
            );

        } catch (error) {

            console.log(
                "Erro ao cadastrar curso"
            );

            console.log(error);

        }
    }


    return (

        <div>

            <h1>
                Cadastrar Curso
            </h1>

            <FormCurso
                onSubmit={cadastrar}
            />

        </div>

    );
}