import { useEffect, useState } from "react";
import { listarCurso } from "../../../../services/cursoService";
import type { Curso } from "../../../../types/curso";
import { NavLink } from "react-router";

export default function ListarUsuariosPage() {
    const [ cursos, setCursos ] = useState<Curso[]>([])
   
    useEffect(() => {
        async function carregarCursos(){

            const dados = await listarCurso();

            setCursos(dados);

        }
        carregarCursos();
    }, [])

    return(
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
                        <th>Modalidade</th>
                    </tr>
                </thead>
                <tbody>
                    {cursos.map((curso) => (
                        <tr>
                            <td>{curso.id}</td>
                            <td>{curso.nome}</td>
                            <td>{curso.modalidade}</td>
                        </tr>
                    ))

                    }
                    <tr>

                    </tr>
                </tbody>
            </table>

        </div>
    )
}