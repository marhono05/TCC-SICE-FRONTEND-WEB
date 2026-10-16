import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { grupoWhatsappSchema, type GrupoWhatsappFormData } from "../../schemas/grupoWhatsappSchema";
import type { GrupoWhatsapp } from "../../types/grupoWhatsapp";
import type { Turma } from "../../types/turmas";

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

        if (!grupo) {
            return;
        }

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

        <form onSubmit={handleSubmit(onSubmit)}>

            <label>
                Nome:
            </label>

            <input
                type="text"
                placeholder="Digite o nome do grupo"
                {...register("nome")}
            />

            {errors.nome && (
                <span>
                    {errors.nome.message}
                </span>
            )}

            <br />
            <br />


            <label>
                Identificador:
            </label>

            <input
                type="text"
                placeholder="Digite o identificador do grupo"
                {...register("identificador")}
            />

            {errors.identificador && (
                <span>
                    {errors.identificador.message}
                </span>
            )}

            <br />
            <br />


            <h3>
                Tipo do grupo
            </h3>

            <label>

                <input
                    type="radio"
                    value="GERAL_ALUNOS"
                    {...register("tipo")}
                />

                Geral dos Alunos

            </label>

            <br />

            <label>

                <input
                    type="radio"
                    value="GERAL_PROFESSORES"
                    {...register("tipo")}
                />

                Geral dos Professores

            </label>

            <br />

            <label>

                <input
                    type="radio"
                    value="TURMA"
                    {...register("tipo")}
                />

                Turma

            </label>

            {errors.tipo && (
                <span>
                    {errors.tipo.message}
                </span>
            )}

            <br />
            <br />

            {tipo === "TURMA" && (
                <>
                    <label>
                        Turma:
                    </label>

                    <select
                        {...register("turmaId", {
                            setValueAs: (value) =>
                                value === ""
                                    ? null
                                    : Number(value)
                        })}
                    >

                        <option value="">
                            Selecione uma turma
                        </option>

                        {turmas.map((turma) => (

                            <option
                                key={turma.id}
                                value={turma.id}
                            >
                                {turma.cursoNome}
                                {" - "}
                                {turma.anoLetivo}
                                {" - "}
                                {turma.etapa}
                                {" - "}
                                {turma.modalidade}
                            </option>

                        ))}

                    </select>

                    {errors.turmaId && (
                        <span>
                            {errors.turmaId.message}
                        </span>
                    )}

                    <br />
                    <br />
                </>
            )}


            <button type="submit" disabled={salvando}>
                {salvando ? "Salvando..." : "Salvar"}
            </button>

        </form>

    );
}