import { NavLink, Outlet } from "react-router";
import { useAuth } from "../hooks/useAuth";

export default function LayoutPrincipal() {
    const { usuario, logout } = useAuth();
    return (
        <div>
            <header>
                <h1>SICE</h1>
                <nav>
                    <NavLink to="/eventos">
                        Eventos
                    </NavLink>
                    <NavLink to="/usuarios">
                        Usuarios
                    </NavLink>
                    <NavLink to="/Turmas">
                        Turmas
                    </NavLink>
                    <NavLink to="/cursos">
                        Cursos
                    </NavLink>
                </nav>
            </header>
            <div>
                <span>{usuario?.perfil}</span>
                <button onClick={logout}>
                    Sair
                </button>
            </div>
            <main>
                <Outlet />
            </main>
        </div>
    )
}