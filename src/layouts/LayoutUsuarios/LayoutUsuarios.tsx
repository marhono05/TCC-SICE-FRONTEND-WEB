import { NavLink, Outlet } from "react-router";

export default function LayoutUsuarios() {

    return (
        <div>
            <h2>Gerenciar Usuarios</h2>
            <nav>
                <NavLink to="ALUNO">
                    Alunos
                </NavLink>
                <NavLink to="PROFESSOR">
                    Professores
                </NavLink>
                <NavLink to="SECRETARIA">
                    Secretaria
                </NavLink>
            </nav>
            <Outlet />
        </div>

    )
}