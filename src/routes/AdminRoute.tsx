import { Navigate, Outlet } from "react-router";
import { useAuth } from "../hooks/useAuth";

function ProtectedRoute() {
    const { usuario } = useAuth();

    if(usuario?.perfil != "ADMIN"){
        return <Navigate to="/eventos" replace/>
    }
    return <Outlet />
}

export default ProtectedRoute;