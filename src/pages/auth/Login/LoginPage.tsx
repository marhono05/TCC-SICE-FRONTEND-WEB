import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../../hooks/useAuth";
import type { SubmitEvent } from "react";

export default function LoginPage() {

    const [identificador, setIdentificador] = useState("");
    const [senha, setSenha] = useState("");

    const { login } = useAuth();

    const navigate = useNavigate();

    async function entrar(
        event: SubmitEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        try {

            const usuario = await login({
                identificador,
                senha
            });

            if (usuario.perfil === "ADMIN") {
                navigate("/admin", { replace: true })
            } else {
                navigate("/eventos", { replace: true })
            }

        } catch (error) {

            console.log("Erro ao fazer login");
            console.log(error);

        }
    }

    return (
        <div>
            <h1>Login</h1>
            <form onSubmit={entrar} >
                <input
                    type="text"
                    placeholder="Identificador"
                    value={identificador}
                    onChange={(event) => setIdentificador(event.target.value)}
                />
                <input
                    type="password"
                    placeholder="Senha"
                    value={senha}
                    onChange={(event) => setSenha(event.target.value)}
                />
                <button type="submit" >
                    Entrar
                </button>
            </form>
        </div>
    )
}