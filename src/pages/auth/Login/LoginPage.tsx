import { useState, type SubmitEvent } from "react";
import { Navigate, useNavigate } from "react-router";
import axios from "axios";
import { useAuth } from "../../../hooks/useAuth";

export default function LoginPage() {
  const [identificador, setIdentificador] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [entrando, setEntrando] = useState(false);
  const { login, usuario } = useAuth();
  const navigate = useNavigate();

  async function entrar(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");
    setEntrando(true);

    try {
      const resposta = await login({ identificador, senha });

      // Esta verificação vem ANTES do perfil: inclui o ADMIN no primeiro acesso.
      if (resposta.primeiroAcesso) {
        navigate("/alterar-senha", { replace: true });
      } else {
        navigate("/dashboard", {
          replace: true,
        });
      }
    } catch (error) {
      setErro(
        axios.isAxiosError(error) && error.response?.status === 401
          ? "Identificador ou senha inválidos."
          : "Não foi possível entrar. Tente novamente."
      );
    } finally {
      setEntrando(false);
    }
  }

  // Evita que uma pessoa autenticada volte ao formulário de login.
  if (usuario) {
    const destino = usuario.primeiroAcesso
      ? "/alterar-senha"
      : "/dashboard";
    return <Navigate to={destino} replace />;
  }

  return (
    <main>
      <h1>Login</h1>
      <form onSubmit={entrar}>
        <label htmlFor="identificador">Identificador</label>
        <input
          id="identificador"
          type="text"
          autoComplete="username"
          placeholder="Identificador"
          value={identificador}
          onChange={(event) => setIdentificador(event.target.value)}
          required
          disabled={entrando}
        />
        <label htmlFor="senha">Senha</label>
        <input
          id="senha"
          type="password"
          autoComplete="current-password"
          placeholder="Senha"
          value={senha}
          onChange={(event) => setSenha(event.target.value)}
          required
          disabled={entrando}
        />
        {erro && <p role="alert">{erro}</p>}
        <button type="submit" disabled={entrando}>
          {entrando ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </main>
  );
}
