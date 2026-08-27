import { useState, type ReactNode } from "react";

import { AuthContext } from "../contexts/AuthContext";
import { authService } from "../services/authService";
import { setToken } from "../services/api";

import type { LoginRequest, LoginResponse } from "../types/auth";

type AuthProviderProps = {
  children: ReactNode;
};

function AuthProvider({ children }: AuthProviderProps) {

  const [usuario, setUsuario] = useState<LoginResponse | null>(null);

  const isAuthenticated = usuario !== null;

  async function login(dados: LoginRequest) {

    const response = await authService.login(dados);

    setToken(response.token);
    setUsuario(response);

    return response;
  }

  function logout() {
    setToken(null);
    setUsuario(null);
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        usuario,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;