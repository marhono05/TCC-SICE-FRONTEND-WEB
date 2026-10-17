import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { turmaSchema, type TurmaFormData } from "../../schemas/turmaSchemas";
import type { Curso } from "../../types/curso";
import type { Turma } from "../../types/turmas";
import CampoFormulario from "../ui/CampoFormulario";
import SecaoFormulario from "../ui/SecaoFormulario";
import Botao from "../ui/Botao";
import "./FormTurma.css";

type FormTurmaProps = {
    turma?: Turma;
    cursos: Curso[];
    salvando?: boolean;
    onSubmit: (dados: TurmaFormData) => Promise<void> | void;
};

export default function FormTurma({
    turma,
    cursos,
    onSubmit,
    salvando = false
}: FormTurmaProps) {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm<TurmaFormData>({
        resolver: zodResolver(turmaSchema),
        defaultValues: {
            anoLetivo: turma?.anoLetivo,
            etapa: turma?.etapa,
            modalidade: turma?.modalidade ?? "MEDIO",
            cursoId: turma?.cursoId
        }
    });

    useEffect(() => {
        if (!turma) return;
        reset({
            anoLetivo: turma.anoLetivo,
            etapa: turma.etapa,
            modalidade: turma.modalidade,
            cursoId: turma.cursoId
        });
    }, [turma, reset]);

    return (
        <form className="sice-turma-form" onSubmit={handleSubmit(onSubmit)}>
            <fieldset className="sice-turma-form__fieldset" disabled={salvando}>
                <SecaoFormulario
                    id="turma-secao-dados"
                    titulo="Dados da turma"
                    descricao="Informe o ano letivo e o curso ao qual a turma pertence."
                    icone="bi-mortarboard"
                >
                    <div className="sice-turma-form__grade">
                        <CampoFormulario
                            id="turma-ano-letivo"
                            rotulo="Ano letivo"
                            obrigatorio
                            erro={errors.anoLetivo?.message}
                        >
                            <input
                                id="turma-ano-letivo"
                                type="number"
                                inputMode="numeric"
                                className="sice-campo__controle"
                                placeholder="Ex.: 2026"
                                aria-invalid={Boolean(errors.anoLetivo)}
                                aria-describedby={errors.anoLetivo ? "turma-ano-letivo-erro" : undefined}
                                {...register("anoLetivo", { valueAsNumber: true })}
                            />
                        </CampoFormulario>

                        <CampoFormulario
                            id="turma-curso"
                            rotulo="Curso"
                            obrigatorio
                            erro={errors.cursoId?.message}
                        >
                            <select
                                id="turma-curso"
                                className="sice-campo__controle"
                                aria-invalid={Boolean(errors.cursoId)}
                                aria-describedby={errors.cursoId ? "turma-curso-erro" : undefined}
                                {...register("cursoId", { valueAsNumber: true })}
                            >
                                <option value="">Selecione um curso</option>
                                {cursos.map((curso) => (
                                    <option key={curso.id} value={curso.id}>
                                        {curso.nome}{!curso.ativo ? " (inativo)" : ""}
                                    </option>
                                ))}
                            </select>
                        </CampoFormulario>
                    </div>
                </SecaoFormulario>

                <SecaoFormulario
                    id="turma-secao-classificacao"
                    titulo="Classificação da turma"
                    descricao="Selecione a etapa e a modalidade de ensino."
                    icone="bi-journal-bookmark"
                >
                    <div className="sice-turma-form__grupos">
                        <fieldset
                            className="sice-opcoes-formulario"
                            aria-describedby={errors.etapa ? "turma-etapa-erro" : undefined}
                        >
                            <legend className="sice-opcoes-formulario__rotulo">
                                Etapa <span className="sice-campo__obrigatorio" aria-hidden="true">*</span>
                            </legend>
                            <div className="sice-opcoes-formulario__grade sice-opcoes-formulario__grade--tres">
                                <label className="sice-opcao-formulario">
                                    <input type="radio" value="PRIMEIRA" {...register("etapa")} />
                                    <span>Primeira</span>
                                </label>
                                <label className="sice-opcao-formulario">
                                    <input type="radio" value="SEGUNDA" {...register("etapa")} />
                                    <span>Segunda</span>
                                </label>
                                <label className="sice-opcao-formulario">
                                    <input type="radio" value="TERCEIRA" {...register("etapa")} />
                                    <span>Terceira</span>
                                </label>
                            </div>
                            {errors.etapa && (
                                <p id="turma-etapa-erro" className="sice-campo__erro" role="alert">
                                    {errors.etapa.message}
                                </p>
                            )}
                        </fieldset>

                        <fieldset
                            className="sice-opcoes-formulario"
                            aria-describedby={errors.modalidade ? "turma-modalidade-erro" : undefined}
                        >
                            <legend className="sice-opcoes-formulario__rotulo">
                                Modalidade <span className="sice-campo__obrigatorio" aria-hidden="true">*</span>
                            </legend>
                            <div className="sice-opcoes-formulario__grade">
                                <label className="sice-opcao-formulario">
                                    <input type="radio" value="MEDIO" {...register("modalidade")} />
                                    <i className="bi bi-book" aria-hidden="true" />
                                    <span>Ensino Médio</span>
                                </label>
                                <label className="sice-opcao-formulario">
                                    <input type="radio" value="TECNICO" {...register("modalidade")} />
                                    <i className="bi bi-tools" aria-hidden="true" />
                                    <span>Ensino Técnico</span>
                                </label>
                            </div>
                            {errors.modalidade && (
                                <p id="turma-modalidade-erro" className="sice-campo__erro" role="alert">
                                    {errors.modalidade.message}
                                </p>
                            )}
                        </fieldset>
                    </div>
                </SecaoFormulario>

                <div className="sice-turma-form__acoes">
                    <Botao type="submit" icone="bi-check-lg" disabled={salvando}>
                        {salvando ? "Salvando..." : "Salvar turma"}
                    </Botao>
                </div>
            </fieldset>
        </form>
    );
}
