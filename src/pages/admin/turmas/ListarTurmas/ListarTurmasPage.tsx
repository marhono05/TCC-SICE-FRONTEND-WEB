import { useEffect, useState } from "react"
import { listarTurma } from "../../../../services/turmaService"
import type { Turma } from "../../../../types/turmas";
import { NavLink } from "react-router";

export default function ListarTurmasPage() {
    
    const [turmas, setTurmas] = useState<Turma[]>([])

    useEffect(() => {
        async function carregarTurmas() {
            const dados = await listarTurma();

            setTurmas(dados);

        }

        carregarTurmas();
        
    }, [])

    return(
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
                    </tr>
                </thead>
                <tbody>
                    {turmas.map((turma) => (
                        <tr>
                            <td>{turma.id}</td>
                            <td>{turma.anoLetivo}</td>
                            <td>{turma.cursoNome}</td>
                            <td>{turma.modalidade}</td>
                            <td>{turma.etapa}</td>
                            <td>{turma.ativo ? 'Ativo' : 'Inativo'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}