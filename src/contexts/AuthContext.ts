import { createContext } from "react";
import type { LoginRequest, LoginResponse } from "../types/auth";

export type AuthContextType = {
  isAuthenticated: boolean;
  usuario: LoginResponse | null;

  login: (dados: LoginRequest) => Promise<LoginResponse>;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextType | null>(null);