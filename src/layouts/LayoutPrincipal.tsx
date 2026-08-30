import { NavLink } from "react-router";
import { useAuth } from "../hooks/useAuth";

export default function LayoutPrincipal() {
    const { usuario } = useAuth();
    return (
        <div>
            <header>
                <h1>SICE</h1>

                <nav>
                    {(usuario?.perfil != "SECRETARIA" && usuario?.perfil != "ADMIN") && (
                        <NavLink to="/eventos">
                            Eventos
                        </NavLink>
                    )}

                </nav>

            </header>
        </div>
    )
}