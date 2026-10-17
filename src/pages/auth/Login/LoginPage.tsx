import { useState, type SubmitEvent } from "react";
import { Navigate, useNavigate } from "react-router";
import axios from "axios";
import { useAuth } from "../../../hooks/useAuth";
import LayoutAutenticacao from "../../../layouts/LayoutAutenticacao/LayoutAutenticacao";
import CampoFormulario from "../../../components/ui/CampoFormulario";
import Botao from "../../../components/ui/Botao";
import Aviso from "../../../components/ui/Aviso";

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

      // Primeiro acesso deve ser verificado antes do perfil, inclusive para ADMIN.
      if (resposta.primeiroAcesso) {
        navigate("/alterar-senha", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
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
    const destino = usuario.primeiroAcesso ? "/alterar-senha" : "/dashboard";
    return <Navigate to={destino} replace />;
  }

  return (
    <LayoutAutenticacao
      titulo="Entrar no SICE"
      descricao="Utilize seu identificador e sua senha para acessar o sistema."
      icone="bi-box-arrow-in-right"
    >
      <form className="sice-auth__formulario" onSubmit={entrar} aria-busy={entrando}>
        <CampoFormulario id="identificador" rotulo="Identificador" obrigatorio>
          <div className="sice-auth__campo-icone">
            <i className="bi bi-person" aria-hidden="true" />
            <input
              id="identificador"
              name="identificador"
              className="sice-campo__controle"
              type="text"
              autoComplete="username"
              placeholder="Digite seu identificador"
              value={identificador}
              onChange={(event) => setIdentificador(event.target.value)}
              required
              disabled={entrando}
            />
          </div>
        </CampoFormulario>

        <CampoFormulario id="senha" rotulo="Senha" obrigatorio>
          <div className="sice-auth__campo-icone">
            <i className="bi bi-lock" aria-hidden="true" />
            <input
              id="senha"
              name="senha"
              className="sice-campo__controle"
              type="password"
              autoComplete="current-password"
              placeholder="Digite sua senha"
              value={senha}
              onChange={(event) => setSenha(event.target.value)}
              required
              disabled={entrando}
            />
          </div>
        </CampoFormulario>

        {erro && <Aviso variante="erro" role="alert">{erro}</Aviso>}

        <div className="sice-auth__acoes">
          <Botao type="submit" icone="bi-box-arrow-in-right" disabled={entrando}>
            {entrando ? "Entrando..." : "Entrar"}
          </Botao>
        </div>
      </form>
    </LayoutAutenticacao>
  );
}
