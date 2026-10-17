import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { grupoWhatsappSchema, type GrupoWhatsappFormData } from "../../schemas/grupoWhatsappSchema";
import type { GrupoWhatsapp } from "../../types/grupoWhatsapp";
import type { Turma } from "../../types/turmas";
import CampoFormulario from "../ui/CampoFormulario";
import SecaoFormulario from "../ui/SecaoFormulario";
import Botao from "../ui/Botao";
import "./FormGrupoWhatsapp.css";

type FormGrupoWhatsappProps = {
    grupo?: GrupoWhatsapp;
    turmas: Turma[];
    salvando?: boolean;
    onSubmit: (dados: GrupoWhatsappFormData) => Promise<void> | void;
};

export default function FormGrupoWhatsapp({
    grupo,
    turmas,
    onSubmit,
    salvando = false
}: FormGrupoWhatsappProps) {
    const {
        register,
        handleSubmit,
        reset,
        control,
        setValue,
        formState: { errors }
    } = useForm<GrupoWhatsappFormData>({
        resolver: zodResolver(grupoWhatsappSchema),
        defaultValues: {
            nome: grupo?.nome ?? "",
            identificador: grupo?.identificador ?? "",
            tipo: grupo?.tipo ?? "GERAL_ALUNOS",
            turmaId: grupo?.turmaId ?? null
        }
    });

    const tipo = useWatch({ control, name: "tipo" });

    useEffect(() => {
        if (!grupo) return;
        reset({
            nome: grupo.nome,
            identificador: grupo.identificador,
            tipo: grupo.tipo,
            turmaId: grupo.turmaId
        });
    }, [grupo, reset]);

    useEffect(() => {
        if (tipo !== "TURMA") {
            setValue("turmaId", null);
        }
    }, [tipo, setValue]);

    return (
        <form className="sice-grupo-form" onSubmit={handleSubmit(onSubmit)}>
            <fieldset className="sice-grupo-form__fieldset" disabled={salvando}>
                <SecaoFormulario
                    id="grupo-secao-dados"
                    titulo="Dados do grupo"
                    descricao="Informe o nome e o identificador utilizado pelo grupo no WhatsApp."
                    icone="bi-whatsapp"
                >
                    <div className="sice-grupo-form__grade">
                        <CampoFormulario
                            id="grupo-nome"
                            rotulo="Nome do grupo"
                            obrigatorio
                            erro={errors.nome?.message}
                        >
                            <input
                                id="grupo-nome"
                                type="text"
                                className="sice-campo__controle"
                                placeholder="Digite o nome do grupo..."
                                aria-invalid={Boolean(errors.nome)}
                                aria-describedby={errors.nome ? "grupo-nome-erro" : undefined}
                                {...register("nome")}
                            />
                        </CampoFormulario>
                        <CampoFormulario
                            id="grupo-identificador"
                            rotulo="Identificador do grupo"
                            obrigatorio
                            erro={errors.identificador?.message}
                        >
                            <input
                                id="grupo-identificador"
                                type="text"
                                className="sice-campo__controle"
                                placeholder="Digite o identificador do grupo..."
                                aria-invalid={Boolean(errors.identificador)}
                                aria-describedby={errors.identificador ? "grupo-identificador-erro" : undefined}
                                {...register("identificador")}
                            />
                        </CampoFormulario>
                    </div>
                </SecaoFormulario>

                <SecaoFormulario
                    id="grupo-secao-destinatarios"
                    titulo="Destinatários do grupo"
                    descricao="Defina se o grupo é geral ou está vinculado a uma turma."
                    icone="bi-people"
                >
                    <fieldset
                        className="sice-opcoes-formulario"
                        aria-describedby={errors.tipo ? "grupo-tipo-erro" : undefined}
                    >
                        <legend className="sice-opcoes-formulario__rotulo">
                            Tipo de grupo <span className="sice-campo__obrigatorio" aria-hidden="true">*</span>
                        </legend>
                        <div className="sice-opcoes-formulario__grade sice-opcoes-formulario__grade--tres">
                            <label className="sice-opcao-formulario">
                                <input type="radio" value="GERAL_ALUNOS" {...register("tipo")} />
                                <i className="bi bi-people" aria-hidden="true" />
                                <span>Geral dos Alunos</span>
                            </label>
                            <label className="sice-opcao-formulario">
                                <input type="radio" value="GERAL_PROFESSORES" {...register("tipo")} />
                                <i className="bi bi-person-workspace" aria-hidden="true" />
                                <span>Geral dos Professores</span>
                            </label>
                            <label className="sice-opcao-formulario">
                                <input type="radio" value="TURMA" {...register("tipo")} />
                                <i className="bi bi-diagram-3" aria-hidden="true" />
                                <span>Turma</span>
                            </label>
                        </div>
                        {errors.tipo && (
                            <p id="grupo-tipo-erro" className="sice-campo__erro" role="alert">
                                {errors.tipo.message}
                            </p>
                        )}
                    </fieldset>

                    {tipo === "TURMA" && (
                        <div className="sice-grupo-form__turma">
                            <CampoFormulario
                                id="grupo-turma"
                                rotulo="Turma vinculada"
                                obrigatorio
                                erro={errors.turmaId?.message}
                            >
                                <select
                                    id="grupo-turma"
                                    className="sice-campo__controle"
                                    aria-invalid={Boolean(errors.turmaId)}
                                    aria-describedby={errors.turmaId ? "grupo-turma-erro" : undefined}
                                    {...register("turmaId", {
                                        setValueAs: (value) => value === "" ? null : Number(value)
                                    })}
                                >
                                    <option value="">Selecione uma turma</option>
                                    {turmas.map((turma) => (
                                        <option key={turma.id} value={turma.id}>
                                            {turma.cursoNome} - {turma.anoLetivo} - {turma.etapa} - {turma.modalidade}
                                            {!turma.ativo ? " (inativa)" : ""}
                                        </option>
                                    ))}
                                </select>
                            </CampoFormulario>
                        </div>
                    )}
                </SecaoFormulario>

                <div className="sice-grupo-form__acoes">
                    <Botao type="submit" icone="bi-check-lg" disabled={salvando}>
                        {salvando ? "Salvando..." : "Salvar grupo"}
                    </Botao>
                </div>
            </fieldset>
        </form>
    );
}
