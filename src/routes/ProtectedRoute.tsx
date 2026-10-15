import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "../hooks/useAuth";

function ProtectedRoute() {
  const { isAuthenticated, usuario } = useAuth();
  const { pathname } = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Impede que um primeiro acesso navegue pelas telas normais do sistema.
  if (usuario?.primeiroAcesso && pathname !== "/alterar-senha") {
    return <Navigate to="/alterar-senha" replace />;
  }

  // Quem já alterou a senha não precisa voltar para a tela de primeiro acesso.
  if (!usuario?.primeiroAcesso && pathname === "/alterar-senha") {
    return <Navigate to={"/dashboard"} replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
