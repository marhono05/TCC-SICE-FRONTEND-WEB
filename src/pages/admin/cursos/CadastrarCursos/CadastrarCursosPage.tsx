import { useState, type SubmitEvent } from "react";
import { cadastrarCurso } from "../../../../services/cursoService";

export default function CadastrarCursosPage() {
    const [nome, setNome] = useState('');


    async function cadastrar(
        event: SubmitEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        try {

            const curso = await cadastrarCurso({
                nome
            });

        } catch (error) {

            console.log("Erro ao cadastrar curso")
            console.log(error)

        }

    }

    return (
        <div>
            <h1>Cadastrar Curso</h1>

            <form onSubmit={cadastrar}>
                <label>Nome: </label>
                <input
                    type="text"
                    placeholder="Digite o nome do curso"
                    value={nome}
                    onChange={(event) => setNome(event.target.value)}
                />
                <br/><br/>
                <input
                    type="submit"
                />
            </form>

        </div>
    )
}