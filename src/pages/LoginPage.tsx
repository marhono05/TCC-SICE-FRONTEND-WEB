import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { api } from "../services/api";

export default function LoginPage() {

    const navigate = useNavigate();
    const [identificador, setIdentificador] = useState('');
    const [senha, setSenha] = useState('');


    async function entrar(event: React.FormEvent<HTMLFormElement>) {

        event.preventDefault();

        try {

            const response = await api.post("/auth/login", {
                identificador: identificador,
                senha: senha
            });

            console.log("Login realizado com sucesso!!");
            console.log(response.data);

        } catch (error) {

            console.log("Erro ao realizar o login");
            console.log(error);

        }

    }

    return (
        <>
            <div>
                <h1>Login</h1>
                <form onSubmit={entrar} >
                    <input
                        type="text"
                        placeholder="Identificador"
                        onChange={(event) => setIdentificador(event.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="Senha"
                        onChange={(event) => setSenha(event.target.value)}
                    />
                    <button type="submit" >
                        Entrar
                    </button>
                </form>
            </div>
        </>
    )
}