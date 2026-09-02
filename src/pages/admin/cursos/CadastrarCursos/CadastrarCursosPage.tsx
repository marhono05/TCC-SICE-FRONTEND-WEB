import { useState, type SubmitEvent } from "react";
import type { ModalidadeEnsino } from "../../../../types/curso";
import { cadastrarCurso } from "../../../../services/cursoService";

export default function CadastrarCursosPage() {
    const [modalidade, setModalidade] = useState<ModalidadeEnsino>("MEDIO");
    const [nome, setNome] = useState('');


    async function cadastrar(
        event: SubmitEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        try {

            const curso = await cadastrarCurso({
                nome,
                modalidade
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
                <label>
                    <input
                        type="radio"
                        name="modalidade"
                        value="MEDIO"
                        checked={modalidade === "MEDIO"}
                        onChange={() => setModalidade("MEDIO")}
                    />
                    Ensino Médio
                </label>

                <label>
                    <input
                        type="radio"
                        name="modalidade"
                        value="TECNICO"
                        checked={modalidade === "TECNICO"}
                        onChange={() => setModalidade("TECNICO")}
                    />
                    Ensino Técnico
                </label>
                <input
                    type="submit"
                />
            </form>

        </div>
    )
}