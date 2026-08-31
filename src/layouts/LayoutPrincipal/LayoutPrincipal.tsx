import { NavLink, Outlet } from "react-router";
import { useAuth } from "../../hooks/useAuth";

export default function LayoutPrincipal() {

    const { usuario, logout } = useAuth();
    const estaLogado = !!usuario;
    const ehAdmin = usuario?.perfil === "ADMIN";
    const ehSecretaria = usuario?.perfil === "SECRETARIA";
    const ehProfessor = usuario?.perfil === "PROFESSOR";

    const podeGerenciarEventos = ehAdmin || ehSecretaria;

    return (
        <div>
            <header>
                <h1>SICE</h1>

                <span>{usuario?.perfil}</span>

                <button onClick={logout}>
                    Sair
                </button>

                <nav>
                    {(usuario && (
                        podeGerenciarEventos ? (
                            <NavLink to="/gerenciarEventos" >
                                Gerenciar Eventos
                            </NavLink>
                        ) : (
                            <NavLink to="/eventos">
                                Eventos
                            </NavLink>
                        )
                    ))}

                    {(estaLogado && ehAdmin) && (
                        <>
                            <NavLink to="/gerenciarUsuarios/ALUNO">
                                Gerenciar Usuarios
                            </NavLink>
                            <NavLink to="/gerenciarTurmas">
                                Gerenciar Turmas
                            </NavLink>
                            <NavLink to="/gerenciarCursos">
                                Gerenciar Cursos
                            </NavLink>
                        </>
                    )}
                </nav>
            </header>

            <Outlet />

        </div>
    )
}