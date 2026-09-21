import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import type { Curso } from "../types/curso";
import type { Turma } from "../types/turmas";

import {
    turmaSchema,
    type TurmaFormData
} from "../schemas/turmaSchemas";


type FormTurmaProps = {
    turma?: Turma;
    cursos: Curso[];
    onSubmit: (dados: TurmaFormData) => Promise<void> | void;
};


export default function FormTurma({
    turma,
    cursos,
    onSubmit
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

        if (!turma) {
            return;
        }

        reset({
            anoLetivo: turma.anoLetivo,
            etapa: turma.etapa,
            modalidade: turma.modalidade,
            cursoId: turma.cursoId
        });

    }, [turma, reset]);


    return (

        <form onSubmit={handleSubmit(onSubmit)}>

            {/* ANO LETIVO */}

            <label>
                Ano Letivo:
            </label>

            <input
                type="number"
                placeholder="Digite o ano letivo"
                {...register("anoLetivo", {
                    valueAsNumber: true
                })}
            />

            {errors.anoLetivo && (
                <span>
                    {errors.anoLetivo.message}
                </span>
            )}

            <br />
            <br />


            {/* ETAPA */}

            <h3>
                Etapa
            </h3>

            <label>

                <input
                    type="radio"
                    value="PRIMEIRA"
                    {...register("etapa")}
                />

                Primeira

            </label>

            <br />

            <label>

                <input
                    type="radio"
                    value="SEGUNDA"
                    {...register("etapa")}
                />

                Segunda

            </label>

            <br />

            <label>

                <input
                    type="radio"
                    value="TERCEIRA"
                    {...register("etapa")}
                />

                Terceira

            </label>

            {errors.etapa && (
                <span>
                    {errors.etapa.message}
                </span>
            )}

            <br />
            <br />


            {/* CURSO */}

            <label>
                Curso:
            </label>

            <select
                {...register("cursoId", {
                    valueAsNumber: true
                })}
            >

                <option value="">
                    Selecione um curso
                </option>

                {cursos.map((curso) => (

                    <option
                        key={curso.id}
                        value={curso.id}
                    >
                        {curso.nome}
                    </option>

                ))}

            </select>

            {errors.cursoId && (
                <span>
                    {errors.cursoId.message}
                </span>
            )}

            <br />
            <br />


            {/* MODALIDADE */}

            <h3>
                Modalidade
            </h3>

            <label>

                <input
                    type="radio"
                    value="MEDIO"
                    {...register("modalidade")}
                />

                Ensino Médio

            </label>


            <label>

                <input
                    type="radio"
                    value="TECNICO"
                    {...register("modalidade")}
                />

                Ensino Técnico

            </label>

            {errors.modalidade && (
                <span>
                    {errors.modalidade.message}
                </span>
            )}

            <br />
            <br />


            <button type="submit">
                Salvar
            </button>

        </form>

    );
}