import { useEffect, useState } from "react";
import { alterarStatusCurso, listarCurso } from "../../../../services/cursoService";
import type { Curso } from "../../../../types/curso";
import { NavLink } from "react-router";

export default function ListarCursosPage() {

    const [loading, setLoading] = useState(true);
    const [cursos, setCursos] = useState<Curso[]>([])

    async function carregarCursos() {
        
        //setLoading(true);
        try {
            const dados = await listarCurso();
            setCursos(dados);

        } catch (error) {
            console.log('Erro ao carregar os cursos ' + error);
        } finally {
            setLoading(false);
        }

    }

    useEffect(() => {
        carregarCursos();
    }, [])

    async function alterarStatus(id: number, ativo: boolean) {
        try {
            await alterarStatusCurso(id, ativo);
            await carregarCursos();
        } catch (error) {
            console.log("Erro ao alterar status", error);
        }
    }

    return (
        <div>
            <h2>Gerenciar Cursos</h2>
            <NavLink to="/cadastrarCursos" >
                Cadastrar Curso
            </NavLink>
            <table>
                <thead>
                    <tr>
                        <th>Id</th>
                        <th>Nome</th>
                        <th>Status</th>
                        <th colSpan={2} >Ações</th>
                    </tr>
                </thead>
                {(loading ? (
                    <tbody>
                        <tr>
                            <td colSpan={4}>Carregando Cursos</td>
                        </tr>
                    </tbody>
                ) : (
                    <tbody>
                        {cursos.map((curso) => (
                            <tr key={curso.id}>
                                <td>{curso.id}</td>
                                <td>{curso.nome}</td>
                                <td>{curso.ativo ? 'Ativo' : 'Inativo'}</td>
                                <td>
                                    <NavLink to={`/editarCursos/${curso.id}`}>
                                        Editar
                                    </NavLink>
                                </td>
                                <td>
                                    <button
                                        onClick={() => alterarStatus(curso.id, !curso.ativo)}
                                    >
                                        {curso.ativo ? 'Desativar' : 'Reativar'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                ))}
            </table>

        </div>
    )
}