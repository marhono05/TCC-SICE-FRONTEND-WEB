import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuth";

export default function LoginPage() {

    const [identificador, setIdentificador] = useState("");
    const [senha, setSenha] = useState("");

    const { login } = useAuth();

    const navigate = useNavigate();

    async function entrar(
        event: React.SubmitEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        try {

            const response = await login({
                identificador,
                senha
            });

            console.log(response);

            // if(response.primeiroAcesso){
            //     navigate("/alterar-senha")
            //     return;
            // }

            navigate("/eventos")

        } catch (error) {

            console.log("Erro ao fazer login");
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