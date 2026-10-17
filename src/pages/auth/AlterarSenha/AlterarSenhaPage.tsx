import { useState } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";

import { useAuth } from "../../../hooks/useAuth";
import {
  alterarSenhaSchema,
  type AlterarSenhaFormData,
} from "../../../schemas/alterarSenhaSchema";
import { alterarSenha } from "../../../services/usuarioService";
import LayoutAutenticacao from "../../../components/ui/LayoutAutenticacao";
import CampoFormulario from "../../../components/ui/CampoFormulario";
import Botao from "../../../components/ui/Botao";
import Aviso from "../../../components/ui/Aviso";

export default function AlterarSenhaPage() {
  const navigate = useNavigate();
  const { atualizarSessao, logout } = useAuth();
  const [saindo, setSaindo] = useState(false);
  const [erroServidor, setErroServidor] = useState("");
  const [salvouSenha, setSalvouSenha] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AlterarSenhaFormData>({
    resolver: zodResolver(alterarSenhaSchema),
    defaultValues: {
      senhaAtual: "",
      novaSenha: "",
      confirmarSenha: "",
    },
  });

  async function salvar(dados: AlterarSenhaFormData) {
    setErroServidor("");

    let senhaAlterada = salvouSenha;

    try {
      if (!senhaAlterada) {
        await alterarSenha({
          senhaAtual: dados.senhaAtual,
          novaSenha: dados.novaSenha,
        });
        senhaAlterada = true;
        setSalvouSenha(true);
      }

      // /auth/me lê o primeiroAcesso atualizado do banco de dados.
      // Só liberamos a navegação após confirmar o estado no servidor.
      const usuarioAtualizado = await atualizarSessao();

      if (usuarioAtualizado.primeiroAcesso) {
        setErroServidor("A alteração ainda não foi confirmada. Tente novamente.");
        return;
      }

      navigate("/dashboard", { replace: true });
    } catch (error) {
      if (senhaAlterada) {
        setErroServidor("A senha foi alterada, mas não foi possível atualizar a sessão. Recarregue a página para continuar.");
        return;
      }

      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const mensagem = error.response?.data?.mensagem;
        if (status === 400) {
          setErroServidor(typeof mensagem === "string" ? mensagem : "Verifique a senha atual e tente novamente.");
          return;
        }
        if (status === 401) {
          setErroServidor("Sua sessão expirou. Entre novamente para alterar a senha.");
          return;
        }
        if (status === 403) {
          setErroServidor("Não foi possível validar a solicitação. Recarregue a página e tente novamente.");
          return;
        }
      }

      setErroServidor("Não foi possível alterar a senha. Tente novamente.");
    }
  }

  async function sair() {
    setSaindo(true);
    setErroServidor("");
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch {
      setErroServidor("Não foi possível encerrar a sessão. Tente novamente.");
    } finally {
      setSaindo(false);
    }
  }

  const camposBloqueados = isSubmitting || salvouSenha || saindo;

  return (
    <LayoutAutenticacao
      titulo="Primeiro acesso ao SICE"
      descricao="Para proteger sua conta, crie uma nova senha antes de acessar o sistema."
      icone="bi-shield-lock"
    >
      <form className="sice-auth__formulario" onSubmit={handleSubmit(salvar)} noValidate aria-busy={isSubmitting || saindo}>
        <CampoFormulario id="senhaAtual" rotulo="Senha atual" erro={errors.senhaAtual?.message} obrigatorio>
          <div className="sice-auth__campo-icone">
            <i className="bi bi-lock" aria-hidden="true" />
            <input
              id="senhaAtual"
              className="sice-campo__controle"
              type="password"
              autoComplete="current-password"
              disabled={camposBloqueados}
              aria-invalid={!!errors.senhaAtual}
              aria-describedby={errors.senhaAtual ? "senhaAtual-erro" : undefined}
              {...register("senhaAtual")}
            />
          </div>
        </CampoFormulario>

        <CampoFormulario
          id="novaSenha"
          rotulo="Nova senha"
          erro={errors.novaSenha?.message}
          ajuda="Mínimo de 6 caracteres. Use uma senha diferente da atual."
          obrigatorio
        >
          <div className="sice-auth__campo-icone">
            <i className="bi bi-key" aria-hidden="true" />
            <input
              id="novaSenha"
              className="sice-campo__controle"
              type="password"
              autoComplete="new-password"
              disabled={camposBloqueados}
              aria-invalid={!!errors.novaSenha}
              aria-describedby={errors.novaSenha ? "novaSenha-erro novaSenha-ajuda" : "novaSenha-ajuda"}
              {...register("novaSenha")}
            />
          </div>
        </CampoFormulario>

        <CampoFormulario id="confirmarSenha" rotulo="Confirmar nova senha" erro={errors.confirmarSenha?.message} obrigatorio>
          <div className="sice-auth__campo-icone">
            <i className="bi bi-check2-circle" aria-hidden="true" />
            <input
              id="confirmarSenha"
              className="sice-campo__controle"
              type="password"
              autoComplete="new-password"
              disabled={camposBloqueados}
              aria-invalid={!!errors.confirmarSenha}
              aria-describedby={errors.confirmarSenha ? "confirmarSenha-erro" : undefined}
              {...register("confirmarSenha")}
            />
          </div>
        </CampoFormulario>

        {erroServidor && <Aviso variante="erro" role="alert">{erroServidor}</Aviso>}

        <div className="sice-auth__acoes">
          <Botao type="submit" icone={salvouSenha ? "bi-arrow-right" : "bi-check-circle"} disabled={isSubmitting || saindo}>
            {isSubmitting ? "Salvando..." : salvouSenha ? "Continuar" : "Alterar senha e continuar"}
          </Botao>
          <Botao type="button" variante="secundario" icone="bi-box-arrow-left" onClick={sair} disabled={isSubmitting || saindo}>
            {saindo ? "Saindo..." : "Sair"}
          </Botao>
        </div>
      </form>
    </LayoutAutenticacao>
  );
}
