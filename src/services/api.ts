import axios from "axios";

export const api = axios.create({
    baseURL: "http://localhost:8080",
});

let token: string | null = null;

export function setToken(novoToken: string | null){
    token = novoToken;
}

api.interceptors.request.use((config) => {
    if (token){
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;

});