import { useEffect, useState, type SubmitEvent } from "react"
import { listarCurso } from "../../../../services/cursoService";
import { cadastrarTurma } from "../../../../services/turmaService";
import type { Curso } from "../../../../types/curso";
import type { ModalidadeEnsino } from "../../../../types/turmas";

export default function CadastrarTurmasPage() {

    const [anoLetivo, setAnoLetivo] = useState<number>(0);
    const [etapa, setEtapa] = useState('');
    const [modalidade, setModalidade] = useState<ModalidadeEnsino>("MEDIO");
    const [cursoId, setCursoId] = useState<number | null>(null);
    const [cursos, setCursos] = useState<Curso[]>([])

    useEffect(() => {
        async function carregarCursos() {

            const dados = await listarCurso();

            setCursos(dados);

        }
        carregarCursos();
    }, [])

    async function cadastrar(
        event: SubmitEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        try {

            if (cursoId === null) {
                alert("Selecione um curso");
                return;
            }

            console.log({
                anoLetivo,
                etapa,
                modalidade,
                cursoId
            });

            const turma = await cadastrarTurma({
                anoLetivo,
                etapa,
                modalidade,
                cursoId
            });

        } catch (error: any) {
            console.log("ERRO:", error);
            console.log("STATUS:", error.response?.status);
            console.log("RESPOSTA DO BACKEND:", error.response?.data);
        }
    }

    return (
        <div>
            <h2>Cadastrar Turmas</h2>
            <form onSubmit={cadastrar}>
                <label>Ano Letivo: </label>
                <input
                    type="text"
                    placeholder="Digite o ano inicial da turma"
                    onChange={(event) => setAnoLetivo(Number(event.target.value))}
                />
                <br /><br />

                <label>
                    <input
                        type="radio"
                        name="etapa"
                        value="PRIMEIRA"
                        checked={etapa === "PRIMEIRA"}
                        onChange={() => setEtapa("PRIMEIRA")}
                    />
                    Primeira
                </label>

                <br />

                <label>

                    <input
                        type="radio"
                        name="etapa"
                        value="SEGUNDA"
                        checked={etapa === "SEGUNDA"}
                        onChange={() => setEtapa("SEGUNDA")}
                    />
                    Segunda
                </label>

                <br></br>

                <label>
                    <input
                        type="radio"
                        name="etapa"
                        value="TERCEIRA"
                        checked={etapa === "TERCEIRA"}
                        onChange={() => setEtapa("TERCEIRA")}
                    />
                    Terceira
                </label>

                <br /><br />

                <label>Curso: </label>

                <select
                    name="cursoId"
                    value={cursoId ?? ""}
                    onChange={(event) => setCursoId(Number(event.target.value))}
                >
                    <option value="">Selecione um Curso</option>

                    {cursos.map((curso) => (
                        <option key={curso.id} value={curso.id}>
                            {curso.nome}
                        </option>
                    ))}
                </select>
                <br /><br />
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
                <br />
                <input
                    type="submit"
                />

            </form>
        </div>
    )
}