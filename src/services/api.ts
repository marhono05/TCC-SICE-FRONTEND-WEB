import axios from "axios";

export const api = axios.create({
    baseURL: "http://localhost:8080",
    //Permite que o navegador inclua credenciais, como cookies, nas requisições feitas pelo Axios
    withCredentials: true,
    withXSRFToken: true
});