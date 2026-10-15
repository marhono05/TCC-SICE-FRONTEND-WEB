import { useState } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";

import { useAuth } from "../../../hooks/useAuth";
import { alterarSenha } from "../../../services/usuarioService";
import "./AlterarSenhaPage.css";
import { alterarSenhaSchema, type AlterarSenhaFormData } from "../../../schemas/alterarSenhaSchema";

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

      const usuarioAtualizado = await atualizarSessao();

      if (usuarioAtualizado.primeiroAcesso) {
        setErroServidor("A alteração ainda não foi confirmada. Tente novamente.");
        return;
      }

      navigate(usuarioAtualizado.perfil === "ADMIN" ? "/admin" : "/eventos", {
        replace: true,
      });
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

  return (
    <main className="alterar-senha-pagina">
      <section className="alterar-senha-painel" aria-labelledby="alterar-senha-titulo">
        <h1 id="alterar-senha-titulo">Primeiro acesso ao SICE</h1>
        <p>
          Para proteger sua conta, você precisa criar uma nova senha antes
          de acessar o sistema.
        </p>

        <form onSubmit={handleSubmit(salvar)} noValidate>
          <div className="alterar-senha-campo">
            <label htmlFor="senhaAtual">Senha atual</label>
            <input
              id="senhaAtual"
              type="password"
              autoComplete="current-password"
              disabled={isSubmitting || salvouSenha || saindo}
              aria-invalid={!!errors.senhaAtual}
              {...register("senhaAtual")}
            />
            {errors.senhaAtual && <span role="alert">{errors.senhaAtual.message}</span>}
          </div>

          <div className="alterar-senha-campo">
            <label htmlFor="novaSenha">Nova senha</label>
            <input
              id="novaSenha"
              type="password"
              autoComplete="new-password"
              disabled={isSubmitting || salvouSenha || saindo}
              aria-invalid={!!errors.novaSenha}
              {...register("novaSenha")}
            />
            {errors.novaSenha && <span role="alert">{errors.novaSenha.message}</span>}
            <small>Mínimo de 6 caracteres.</small>
          </div>

          <div className="alterar-senha-campo">
            <label htmlFor="confirmarSenha">Confirmar nova senha</label>
            <input
              id="confirmarSenha"
              type="password"
              autoComplete="new-password"
              disabled={isSubmitting || salvouSenha || saindo}
              aria-invalid={!!errors.confirmarSenha}
              {...register("confirmarSenha")}
            />
            {errors.confirmarSenha && <span role="alert">{errors.confirmarSenha.message}</span>}
          </div>

          {erroServidor && <p className="alterar-senha-erro" role="alert">{erroServidor}</p>}

          <button type="submit" disabled={isSubmitting || saindo}>
            {isSubmitting
              ? "Salvando..."
              : salvouSenha
                ? "Continuar"
                : "Alterar senha e continuar"}
          </button>
          <button
            type="button"
            className="alterar-senha-sair"
            onClick={sair}
            disabled={isSubmitting || saindo}
          >
            {saindo ? "Saindo..." : "Sair"}
          </button>
        </form>
      </section>
    </main>
  );
}
