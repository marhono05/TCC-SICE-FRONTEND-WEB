import { useEffect, useState } from "react"
import { alterarStatusTurma, listarTurma } from "../../../../services/turmaService"
import type { Turma } from "../../../../types/turmas";
import { NavLink } from "react-router";

export default function ListarTurmasPage() {

    const [turmas, setTurmas] = useState<Turma[]>([])

    async function carregarTurmas() {
        const dados = await listarTurma();

        setTurmas(dados);

    }

    useEffect(() => {
        carregarTurmas();

    }, [])

    async function alterarStatus(id: number, ativo: boolean) {
        try {
            await alterarStatusTurma(id, ativo);
            await carregarTurmas();
        } catch (error) {
            console.log("Erro ao alterar status", error);
        }
    }

    return (
        <div>
            <h2>Gerenciar Turmas</h2>
            <NavLink to="/cadastrarTurmas">
                Cadastrar Turma
            </NavLink>
            <table>
                <thead>
                    <tr>
                        <th>Id</th>
                        <th>Ano Letivo</th>
                        <th>Curso</th>
                        <th>Modalidade</th>
                        <th>Etapa</th>
                        <th>Status</th>
                        <th colSpan={2}>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {turmas.map((turma) => (
                        <tr key={turma.id}>
                            <td>{turma.id}</td>
                            <td>{turma.anoLetivo}</td>
                            <td>{turma.cursoNome}</td>
                            <td>{turma.modalidade}</td>
                            <td>{turma.etapa}</td>
                            <td>{turma.ativo ? 'Ativo' : 'Inativo'}</td>
                            <td>
                                <NavLink to={`/editarTurmas/${turma.id}`} >Editar</NavLink>
                            </td>
                            <td>
                                <button>
                                    <button
                                        onClick={() => alterarStatus(turma.id, !turma.ativo)}
                                    >
                                        {turma.ativo ? 'Desativar' : 'Reativar'}
                                    </button>
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}