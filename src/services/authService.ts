import { api } from "./api";
import type { LoginRequest, LoginResponse } from "../types/auth";

async function login(dados: LoginRequest): Promise<LoginResponse> {

    const respose = await api.post<LoginResponse>(
        "auth/login",
        dados
    );

    return respose.data;

}

export const authService = {
    login
}