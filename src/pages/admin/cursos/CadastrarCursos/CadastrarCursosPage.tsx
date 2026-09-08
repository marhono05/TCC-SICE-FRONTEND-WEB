import type { CriarCurso } from "../../../../types/curso";
import { cadastrarCurso } from "../../../../services/cursoService";
import FormCurso from "../../../../components/FormCurso";

export default function CadastrarCursosPage() {

    async function cadastrar(dados: CriarCurso) {

        try {

            const curso = await cadastrarCurso(dados);

        } catch (error) {

            console.log("Erro ao cadastrar curso");
            console.log(error);

        }
    }

    return (
        <div>
            <h1>Cadastrar Curso</h1>

            <FormCurso
                onSubmit={cadastrar}
            />
        </div>
    );
}