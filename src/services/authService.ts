import { api } from "./api";
import type { LoginRequest, LoginResponse } from "../types/auth";

async function login(dados: LoginRequest): Promise<LoginResponse> {

    const respose = await api.post<LoginResponse>(
        "auth/login",
        dados
    );

    return respose.data;

}

async function logout():Promise<void> {
    await api.post("/auth/logout")
}

async function me(): Promise<LoginResponse> {
    
    const respose = await api.get<LoginResponse>("/auth/me");

    return respose.data;

}

async function csrf(): Promise<void>{
    await api.get("/auth/csrf")
}

export const authService = {
    login,
    logout,
    me,
    csrf
}