import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { PerfilUsuario } from "../../schemas/perfilUsuarioSchema";
import { usuarioEdicaoSchema, usuarioSchema, type UsuarioFormData } from "../../schemas/usuarioSchema";
import type { Turma } from "../../types/turmas";
import type { Usuario } from "../../types/usuario";
import CampoFormulario from "../ui/CampoFormulario";
import Botao from "../ui/Botao";
import "./FormUsuario.css";
import SecaoFormulario from "../ui/SecaoFormulario";

type FormUsuarioProps = {
    usuario?: Usuario;
    perfil: PerfilUsuario;
    turmas: Turma[];
    salvando?: boolean;
    onSubmit: (dados: UsuarioFormData) => Promise<void> | void;
};

export default function FormUsuario({
    usuario,
    perfil,
    turmas,
    onSubmit,
    salvando = false
}: FormUsuarioProps) {
    const {
        register,
        handleSubmit,
        control,
        setValue,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<UsuarioFormData>({
        resolver: zodResolver(usuario ? usuarioEdicaoSchema : usuarioSchema),
        defaultValues: {
            identificador: usuario?.identificador ?? "",
            nome: usuario?.nome ?? "",
            email: usuario?.email ?? "",
            perfil,
            turmasIds: perfil === "ALUNO" ? usuario?.turmasIds ?? [] : []
        }
    });

    const [pesquisa, setPesquisa] = useState("");
    const turmasSelecionadas = useWatch({ control, name: "turmasIds" }) ?? [];

    useEffect(() => {
        reset({
            identificador: usuario?.identificador ?? "",
            nome: usuario?.nome ?? "",
            email: usuario?.email ?? "",
            perfil,
            turmasIds: perfil === "ALUNO" ? usuario?.turmasIds ?? [] : []
        });
    }, [usuario, perfil, reset]);

    useEffect(() => {
        if (perfil !== "ALUNO") {
            setValue("turmasIds", [], { shouldValidate: true });
        }
    }, [perfil, setValue]);

    const turmasFiltradas = turmas.filter((turma) => {
        const texto = `
            ${turma.cursoNome}
            ${turma.etapa}
            ${turma.modalidade}
            ${turma.anoLetivo}
        `.toLowerCase().replace(/\s+/g, " ");
        return texto.includes(pesquisa.toLowerCase().trim());
    });

    function selecionarTurma(turmaId: number) {
        const estaSelecionada = turmasSelecionadas.includes(turmaId);
        if (estaSelecionada) {
            setValue("turmasIds", turmasSelecionadas.filter((id) => id !== turmaId), {
                shouldValidate: true
            });
        } else {
            setValue("turmasIds", [...turmasSelecionadas, turmaId], {
                shouldValidate: true
            });
        }
    }

    const enviando = salvando || isSubmitting;

    return (
        <form className="sice-usuario-form" onSubmit={handleSubmit(onSubmit)}>
            <fieldset className="sice-usuario-form__fieldset" disabled={enviando}>
                <input type="hidden" {...register("perfil")} />

                <SecaoFormulario
                    id="usuario-secao-dados"
                    titulo="Dados do usuário"
                    descricao="Informe os dados de identificação e contato."
                    icone="bi-person-vcard"
                >
                    <div className="sice-usuario-form__grade">
                        <CampoFormulario
                            id="usuario-nome"
                            rotulo="Nome completo"
                            obrigatorio
                            erro={errors.nome?.message}
                            className="sice-usuario-form__coluna-inteira"
                        >
                            <input
                                id="usuario-nome"
                                type="text"
                                className="sice-campo__controle"
                                placeholder="Digite o nome do usuário..."
                                autoComplete="name"
                                aria-invalid={Boolean(errors.nome)}
                                aria-describedby={errors.nome ? "usuario-nome-erro" : undefined}
                                {...register("nome")}
                            />
                        </CampoFormulario>
                        <CampoFormulario
                            id="usuario-email"
                            rotulo="E-mail"
                            obrigatorio
                            erro={errors.email?.message}
                        >
                            <input
                                id="usuario-email"
                                type="email"
                                className="sice-campo__controle"
                                placeholder="Digite o e-mail do usuário..."
                                autoComplete="email"
                                aria-invalid={Boolean(errors.email)}
                                aria-describedby={errors.email ? "usuario-email-erro" : undefined}
                                {...register("email")}
                            />
                        </CampoFormulario>
                        <CampoFormulario
                            id="usuario-identificador"
                            rotulo="Identificador"
                            obrigatorio
                            erro={errors.identificador?.message}
                        >
                            <input
                                id="usuario-identificador"
                                type="text"
                                className="sice-campo__controle"
                                placeholder="Digite o identificador do usuário..."
                                aria-invalid={Boolean(errors.identificador)}
                                aria-describedby={errors.identificador ? "usuario-identificador-erro" : undefined}
                                {...register("identificador")}
                            />
                        </CampoFormulario>
                    </div>
                </SecaoFormulario>

                {perfil === "ALUNO" && (
                    <SecaoFormulario
                        id="usuario-secao-turmas"
                        titulo="Turmas do aluno"
                        descricao="Pesquise e selecione as turmas relacionadas ao aluno."
                        icone="bi-people"
                    >
                        <CampoFormulario id="usuario-pesquisa-turmas" rotulo="Pesquisar turma">
                            <input
                                id="usuario-pesquisa-turmas"
                                type="search"
                                className="sice-campo__controle"
                                placeholder="Curso, etapa, modalidade ou ano..."
                                value={pesquisa}
                                onChange={(event) => setPesquisa(event.target.value)}
                            />
                        </CampoFormulario>
                        <p className="sice-usuario-form__contador" role="status">
                            {turmasSelecionadas.length} {turmasSelecionadas.length === 1 ? "turma selecionada" : "turmas selecionadas"}
                        </p>
                        <div
                            className="sice-usuario-form__lista-turmas"
                            role="group"
                            aria-label="Turmas disponíveis"
                            aria-describedby={errors.turmasIds ? "usuario-turmas-erro" : undefined}
                        >
                            {turmasFiltradas.length === 0 && (
                                <p className="sice-usuario-form__sem-turmas">Nenhuma turma encontrada.</p>
                            )}
                            {turmasFiltradas.map((turma) => (
                                <label
                                    key={turma.id}
                                    className={`sice-usuario-form__turma ${!turma.ativo ? "sice-usuario-form__turma--inativa" : ""}`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={turmasSelecionadas.includes(turma.id)}
                                        onChange={() => selecionarTurma(turma.id)}
                                    />
                                    <span>
                                        {turma.cursoNome} — {turma.etapa} — {turma.modalidade} — {turma.anoLetivo}
                                        {!turma.ativo && <span className="sice-usuario-form__inativa"> (inativa)</span>}
                                    </span>
                                </label>
                            ))}
                        </div>
                        {errors.turmasIds && (
                            <p id="usuario-turmas-erro" className="sice-campo__erro" role="alert">
                                {errors.turmasIds.message}
                            </p>
                        )}
                    </SecaoFormulario>
                )}
                <div className="sice-usuario-form__acoes">
                    <Botao type="submit" icone="bi-check-lg" disabled={enviando}>
                        {enviando ? "Salvando..." : "Salvar usuário"}
                    </Botao>
                </div>
            </fieldset>
        </form>
    );
}
