import { Navigate, Outlet } from "react-router";
import { useAuth } from "../hooks/useAuth";

function SecretariaRoute() {
    const { usuario } = useAuth();

    if(usuario?.perfil != "ADMIN" && usuario?.perfil != "SECRETARIA"){
        return <Navigate to="/eventos" replace/>
    }
    return <Outlet />
}

export default SecretariaRoute;