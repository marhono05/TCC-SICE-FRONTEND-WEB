import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { redefinirSenhaUsuarioSchema, type RedefinirSenhaUsuarioFormData } from "../../schemas/redefinirSenhaUsuarioSchema";
import { redefinirSenhaUsuario } from "../../services/usuarioService";
import type { Usuario } from "../../types/usuario";
import { mensagemErroApi } from "../../utils/erroApi";
import CampoFormulario from "../ui/CampoFormulario";
import Botao from "../ui/Botao";
import Aviso from "../ui/Aviso";
import SecaoFormulario from "../ui/SecaoFormulario";
import "./RedefinirSenhaUsuario.css";

type Props = { usuario: Usuario };

/** Formulário independente: salvar os dados cadastrais nunca envia a senha provisória. */
export default function RedefinirSenhaUsuario({ usuario }: Props) {
    const [erro, setErro] = useState("");
    const [sucesso, setSucesso] = useState("");
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<RedefinirSenhaUsuarioFormData>({
        resolver: zodResolver(redefinirSenhaUsuarioSchema),
        defaultValues: { senhaTemporaria: "", confirmarSenha: "" }
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
        <div className="sice-senha-usuario">
            <SecaoFormulario
                id="redefinicao-senha-titulo"
                titulo="Redefinir senha"
                descricao={`Defina uma senha provisória para ${usuario.nome}. Ela deverá ser alterada no próximo login.`}
                icone="bi-key"
            >
                {!usuario.ativo && (
                    <Aviso variante="alerta" titulo="Conta desativada" className="sice-senha-usuario__mensagem">
                        A redefinição da senha não irá reativar esta conta.
                    </Aviso>
                )}
                <form onSubmit={handleSubmit(salvar)} noValidate>
                    <fieldset className="sice-senha-usuario__fieldset" disabled={isSubmitting}>
                        <div className="sice-senha-usuario__grade">
                            <CampoFormulario
                                id="senhaTemporaria"
                                rotulo="Senha provisória"
                                obrigatorio
                                erro={errors.senhaTemporaria?.message}
                                ajuda="Mínimo de 6 caracteres."
                            >
                                <input
                                    id="senhaTemporaria"
                                    type="password"
                                    autoComplete="new-password"
                                    className="sice-campo__controle"
                                    aria-invalid={Boolean(errors.senhaTemporaria)}
                                    aria-describedby={`senhaTemporaria-ajuda${errors.senhaTemporaria ? " senhaTemporaria-erro" : ""}`}
                                    {...register("senhaTemporaria")}
                                />
                            </CampoFormulario>
                            <CampoFormulario
                                id="confirmarSenhaRedefinida"
                                rotulo="Confirmar senha provisória"
                                obrigatorio
                                erro={errors.confirmarSenha?.message}
                            >
                                <input
                                    id="confirmarSenhaRedefinida"
                                    type="password"
                                    autoComplete="new-password"
                                    className="sice-campo__controle"
                                    aria-invalid={Boolean(errors.confirmarSenha)}
                                    aria-describedby={errors.confirmarSenha ? "confirmarSenhaRedefinida-erro" : undefined}
                                    {...register("confirmarSenha")}
                                />
                            </CampoFormulario>
                        </div>
                        {erro && <Aviso variante="erro" role="alert" className="sice-senha-usuario__mensagem">{erro}</Aviso>}
                        {sucesso && <Aviso variante="sucesso" role="status" className="sice-senha-usuario__mensagem">{sucesso}</Aviso>}
                        <p className="sice-senha-usuario__orientacao">
                            <i className="bi bi-shield-lock" aria-hidden="true" />
                            Entregue a senha provisória ao usuário por um meio privado.
                        </p>
                        <div className="sice-senha-usuario__acoes">
                            <Botao type="submit" icone="bi-key" disabled={isSubmitting}>
                                {isSubmitting ? "Redefinindo..." : "Redefinir senha"}
                            </Botao>
                        </div>
                    </fieldset>
                </form>
            </SecaoFormulario>
        </div>
    );
}
