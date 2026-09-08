import { useState, type SubmitEvent } from "react"
import type { CriarCurso, Curso } from "../types/curso";

interface FormCursoProps {
    curso?: Curso;
    onSubmit: (dados: CriarCurso) => void
}

export default function FormCurso({curso, onSubmit}: FormCursoProps ) {


    const [nome, setNome] = useState(curso?.nome ?? "");

    const handleSubmit = (
        event: SubmitEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        onSubmit({
            nome
        });
    };

    return(
        <form onSubmit={handleSubmit}>
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
    )
}