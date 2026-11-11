import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";

import { alterarSenhaSchema, type AlterarSenhaFormData } from "../../../schemas/alterarSenhaSchema";
import { alterarSenha } from "../../../services/usuarioService";
import PaginaFormulario from "../../../layouts/PaginaFormulario/PaginaFormulario";
import SecaoFormulario from "../../../components/ui/SecaoFormulario";
import CampoFormulario from "../../../components/ui/CampoFormulario";
import Botao from "../../../components/ui/Botao";
import Aviso from "../../../components/ui/Aviso";
import "./AlterarSenhaContaPage.css";

/** Alteração voluntária de senha. O primeiro acesso continua sendo tratado na tela de autenticação. */
export default function AlterarSenhaContaPage() {
  const [erroServidor, setErroServidor] = useState("");
  const [sucesso, setSucesso] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AlterarSenhaFormData>({
    resolver: zodResolver(alterarSenhaSchema),
    defaultValues: { senhaAtual: "", novaSenha: "", confirmarSenha: "" },
  });

  async function salvar(dados: AlterarSenhaFormData) {
    setErroServidor("");
    setSucesso(false);
    try {
      await alterarSenha({ senhaAtual: dados.senhaAtual, novaSenha: dados.novaSenha });
      reset();
      setSucesso(true);
    } catch (erro) {
      if (axios.isAxiosError(erro)) {
        const status = erro.response?.status;
        const mensagem = erro.response?.data?.mensagem;
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

  return (
    <PaginaFormulario
      titulo="Alterar senha"
      descricao="Atualize a senha da sua conta sempre que precisar."
      icone="bi-key"
      voltarPara="/dashboard"
      textoVoltar="Voltar para o painel"
    >
      <SecaoFormulario id="sice-alterar-senha-titulo" titulo="Segurança da conta" descricao="Confirme sua senha atual e escolha uma nova senha." icone="bi-shield-lock">
        <form className="sice-alterar-senha__formulario" onSubmit={handleSubmit(salvar)} noValidate aria-busy={isSubmitting}>
          <CampoFormulario id="conta-senha-atual" rotulo="Senha atual" erro={errors.senhaAtual?.message} obrigatorio>
            <input
              id="conta-senha-atual" className="sice-campo__controle" type="password"
              autoComplete="current-password" disabled={isSubmitting}
              aria-invalid={!!errors.senhaAtual}
              aria-describedby={errors.senhaAtual ? "conta-senha-atual-erro" : undefined}
              {...register("senhaAtual")}
            />
          </CampoFormulario>
          <CampoFormulario
            id="conta-nova-senha" rotulo="Nova senha" erro={errors.novaSenha?.message}
            ajuda="Mínimo de 6 caracteres, com letra maiúscula, minúscula, número e símbolo. A senha deve ser diferente da atual." obrigatorio
          >
            <input
              id="conta-nova-senha" className="sice-campo__controle" type="password"
              autoComplete="new-password" disabled={isSubmitting}
              aria-invalid={!!errors.novaSenha}
              aria-describedby={errors.novaSenha ? "conta-nova-senha-erro conta-nova-senha-ajuda" : "conta-nova-senha-ajuda"}
              {...register("novaSenha")}
            />
          </CampoFormulario>
          <CampoFormulario id="conta-confirmar-senha" rotulo="Confirmar nova senha" erro={errors.confirmarSenha?.message} obrigatorio>
            <input
              id="conta-confirmar-senha" className="sice-campo__controle" type="password"
              autoComplete="new-password" disabled={isSubmitting}
              aria-invalid={!!errors.confirmarSenha}
              aria-describedby={errors.confirmarSenha ? "conta-confirmar-senha-erro" : undefined}
              {...register("confirmarSenha")}
            />
          </CampoFormulario>
          {erroServidor && <Aviso variante="erro" role="alert">{erroServidor}</Aviso>}
          {sucesso && <Aviso variante="sucesso" role="status">Senha alterada com sucesso.</Aviso>}
          <div className="sice-alterar-senha__acoes">
            <Botao type="submit" icone="bi-check-circle" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Salvar nova senha"}
            </Botao>
          </div>
        </form>
      </SecaoFormulario>
    </PaginaFormulario>
  );
}
