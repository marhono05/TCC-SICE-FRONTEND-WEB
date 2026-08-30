import { useEffect, useState, type ReactNode } from "react";

import { AuthContext } from "../contexts/AuthContext";
import { authService } from "../services/authService";

import type { LoginRequest, LoginResponse } from "../types/auth";

type AuthProviderProps = {
  children: ReactNode;
};

function AuthProvider({ children }: AuthProviderProps) {

  const [usuario, setUsuario] = useState<LoginResponse | null>(null);
  const [loading, setLoading] = useState(true)

  const isAuthenticated = usuario !== null;

  useEffect(() => {

    async function inicializarAuth() {

      try{
        
        await authService.csrf();

        const response = await authService.me();

        setUsuario(response);

      }catch(error) {

        setUsuario(null);

      }finally{

        setLoading(false)
      
      }
    }

    inicializarAuth();

  }, [])

  async function login(dados: LoginRequest) {

    const response = await authService.login(dados);

    await authService.csrf();

    setUsuario(response);

    return response;
  }

  async function logout() {
    
    await authService.logout();

    setUsuario(null);

    await authService.csrf();

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
      {!loading && children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;