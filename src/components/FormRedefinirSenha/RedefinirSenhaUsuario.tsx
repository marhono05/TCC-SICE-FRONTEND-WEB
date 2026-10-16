import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { redefinirSenhaUsuarioSchema, type RedefinirSenhaUsuarioFormData } from "../../schemas/redefinirSenhaUsuarioSchema";
import { redefinirSenhaUsuario } from "../../services/usuarioService";
import type { Usuario } from "../../types/usuario";
import { mensagemErroApi } from "../../utils/erroApi";


type Props = { usuario: Usuario };

/** Formulário separado da edição de dados cadastrais: não envia senha ao salvar usuário. */
export default function RedefinirSenhaUsuario({ usuario }: Props) {
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<RedefinirSenhaUsuarioFormData>({
    resolver: zodResolver(redefinirSenhaUsuarioSchema),
    defaultValues: { senhaTemporaria: "", confirmarSenha: "" },
  });

  async function salvar(dados: RedefinirSenhaUsuarioFormData) {
    if (!window.confirm(`Redefinir a senha de ${usuario.nome}? O usuário precisará alterá-la no próximo acesso.`)) return;
    setErro("");
    setSucesso("");
    try {
      await redefinirSenhaUsuario(usuario.id, dados.senhaTemporaria);
      reset();
      setSucesso("Senha provisória definida. O usuário deverá alterá-la no próximo acesso.");
    } catch (falha) {
      setErro(mensagemErroApi(falha, "Não foi possível redefinir a senha do usuário."));
    }
  }

  return (
    <section aria-labelledby="redefinicao-senha-titulo">
      <h2 id="redefinicao-senha-titulo">Redefinir senha</h2>
      <p>Defina uma senha provisória para {usuario.nome}. Ela deverá ser alterada no próximo login.</p>
      {!usuario.ativo && <p>Esta conta está desativada. A redefinição da senha não irá reativá-la.</p>}
      <form onSubmit={handleSubmit(salvar)} noValidate>
        <div>
          <label htmlFor="senhaTemporaria">Senha provisória</label>
          <input id="senhaTemporaria" type="password" autoComplete="new-password"
            disabled={isSubmitting} aria-invalid={!!errors.senhaTemporaria} {...register("senhaTemporaria")} />
          {errors.senhaTemporaria && <p role="alert">{errors.senhaTemporaria.message}</p>}
        </div>
        <div>
          <label htmlFor="confirmarSenhaRedefinida">Confirmar senha provisória</label>
          <input id="confirmarSenhaRedefinida" type="password" autoComplete="new-password"
            disabled={isSubmitting} aria-invalid={!!errors.confirmarSenha} {...register("confirmarSenha")} />
          {errors.confirmarSenha && <p role="alert">{errors.confirmarSenha.message}</p>}
        </div>
        {erro && <p role="alert">{erro}</p>}
        {sucesso && <p role="status">{sucesso}</p>}
        <p><small>Mínimo de 6 caracteres. Entregue a senha provisória ao usuário por um meio privado.</small></p>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Redefinindo..." : "Redefinir senha"}
        </button>
      </form>
    </section>
  );
}
