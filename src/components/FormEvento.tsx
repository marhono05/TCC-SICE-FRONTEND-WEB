import { useEffect, useState } from "react";
import {
    useFieldArray,
    useForm
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import type { Evento } from "../types/evento";
import type { Turma } from "../types/turmas";

import {
    eventoSchema,
    type EventoFormData,
    type PerfilDestinacao
} from "../schemas/eventoSchema";

type EventoFormProps = {
    evento?: Evento;
    turmas: Turma[];
    onSubmit: (dados: EventoFormData) => Promise<void>;
};

export default function FormEvento({
    evento,
    turmas,
    onSubmit
}: EventoFormProps) {

    const {
        register,
        control,
        handleSubmit,
        watch,
        setValue,
        getValues,
        reset,
        formState: { errors }
    } = useForm<EventoFormData>({
        resolver: zodResolver(eventoSchema),

        defaultValues: {
            titulo: evento?.titulo ?? "",
            descricao: evento?.descricao ?? "",
            dataInicio: evento?.dataInicio ?? "",
            horaInicio: evento?.horaInicio?.slice(0, 5) ?? "",

            destinos:
                evento?.destinos.map((destino) => ({
                    perfil: destino.perfil,

                    etapas:
                        destino.perfil === "ALUNO"
                            ? destino.etapas
                            : [],

                    modalidades:
                        destino.perfil === "ALUNO"
                            ? destino.modalidades
                            : [],

                    turmasIds:
                        destino.perfil === "ALUNO"
                            ? destino.turmasIds
                            : []
                })) ?? []
        }
    });

    const {
        fields,
        append,
        remove
    } = useFieldArray({
        control,
        name: "destinos"
    });

    const [
        especificarAlunos,
        setEspecificarAlunos
    ] = useState(false);

    const [
        pesquisa,
        setPesquisa
    ] = useState("");

    useEffect(() => {

        if (!evento) {
            return;
        }

        reset({
            titulo: evento.titulo,
            descricao: evento.descricao,
            dataInicio: evento.dataInicio,
            horaInicio: evento.horaInicio.slice(0, 5),

            destinos: evento.destinos.map((destino) => ({
                perfil: destino.perfil,

                etapas:
                    destino.perfil === "ALUNO"
                        ? destino.etapas
                        : [],

                modalidades:
                    destino.perfil === "ALUNO"
                        ? destino.modalidades
                        : [],

                turmasIds:
                    destino.perfil === "ALUNO"
                        ? destino.turmasIds
                        : []
            }))
        });


        const destinoAluno = evento.destinos.find(
            (destino) =>
                destino.perfil === "ALUNO"
        );


        setEspecificarAlunos(
            destinoAluno !== undefined &&
            (
                destinoAluno.etapas.length > 0 ||
                destinoAluno.modalidades.length > 0 ||
                destinoAluno.turmasIds.length > 0
            )
        );

    }, [evento, reset]);


    const destinos =
        watch("destinos") ?? [];

    const perfilSelecionado = (
        perfil: PerfilDestinacao
    ) => {

        return destinos.some(
            (destino) =>
                destino.perfil === perfil
        );
    };

    const selecionarPerfil = (
        perfil: PerfilDestinacao,
        selecionado: boolean
    ) => {

        if (selecionado) {

            const jaExiste =
                getValues("destinos").some(
                    (destino) =>
                        destino.perfil === perfil
                );

            if (jaExiste) {
                return;
            }

            append({
                perfil,
                etapas: [],
                modalidades: [],
                turmasIds: []
            });

        } else {

            const index =
                getValues("destinos").findIndex(
                    (destino) =>
                        destino.perfil === perfil
                );

            if (index !== -1) {
                remove(index);
            }

            if (perfil === "ALUNO") {

                setEspecificarAlunos(false);
                setPesquisa("");

            }
        }
    };

    const alterarEspecificacaoAluno = (
        index: number,
        ativo: boolean
    ) => {

        setEspecificarAlunos(ativo);


        if (!ativo) {

            setValue(
                `destinos.${index}.etapas`,
                [],
                {
                    shouldValidate: true
                }
            );


            setValue(
                `destinos.${index}.modalidades`,
                [],
                {
                    shouldValidate: true
                }
            );


            setValue(
                `destinos.${index}.turmasIds`,
                [],
                {
                    shouldValidate: true
                }
            );

        }
    };

    const selecionarTurma = (
        index: number,
        turmaId: number
    ) => {

        const turmasSelecionadas =
            getValues(
                `destinos.${index}.turmasIds`
            ) ?? [];


        const estaSelecionada =
            turmasSelecionadas.includes(turmaId);


        if (estaSelecionada) {

            setValue(
                `destinos.${index}.turmasIds`,
                turmasSelecionadas.filter(
                    (id) =>
                        id !== turmaId
                ),
                {
                    shouldValidate: true
                }
            );

        } else {

            setValue(
                `destinos.${index}.turmasIds`,
                [
                    ...turmasSelecionadas,
                    turmaId
                ],
                {
                    shouldValidate: true
                }
            );

        }
    };


    return (

        <form onSubmit={handleSubmit(onSubmit)}>
            <label>
                Título:
            </label>
            
            <input
                type="text"
                placeholder="Digite o título..."
                {...register("titulo")}
            />
            {errors.titulo && (
                <span>
                    {errors.titulo.message}
                </span>
            )}
            <br />
            <br />

            <label>
                Descrição:
            </label>

            <textarea
                placeholder="Digite a descrição..."
                {...register("descricao")}
            />
            {errors.descricao && (
                <span>
                    {errors.descricao.message}
                </span>
            )}
            <br />
            <br />

            <label>
                Data:
            </label>

            <input
                type="date"
                {...register("dataInicio")}
            />

            {errors.dataInicio && (
                <span>
                    {errors.dataInicio.message}
                </span>
            )}
            <br />
            <br />

            <label>
                Hora:
            </label>

            <input
                type="time"
                {...register("horaInicio")}
            />
            {errors.horaInicio && (
                <span>
                    {errors.horaInicio.message}
                </span>
            )}
            <br />
            <br />

            <h2>
                Selecione as destinações do evento:
            </h2>

            <div>

                <label>

                    <input
                        type="checkbox"
                        checked={
                            perfilSelecionado("ALUNO")
                        }
                        onChange={(event) =>
                            selecionarPerfil(
                                "ALUNO",
                                event.target.checked
                            )
                        }
                    />
                    Alunos
                </label>

                <label>

                    <input
                        type="checkbox"
                        checked={
                            perfilSelecionado("PROFESSOR")
                        }
                        onChange={(event) =>
                            selecionarPerfil(
                                "PROFESSOR",
                                event.target.checked
                            )
                        }
                    />
                    Professores
                </label>

            </div>
            {errors.destinos?.message && (
                <span>
                    {errors.destinos.message}
                </span>
            )}

            {fields.map((field, index) => {

                const destino =
                    destinos[index];


                const perfil =
                    destino?.perfil ??
                    field.perfil;


                const turmasSelecionadas =
                    destino?.turmasIds ?? [];

                const turmasFiltradas =
                    turmas.filter((turma) => {

                        const texto = `
                            ${turma.cursoNome}
                            ${turma.anoLetivo}
                            ${turma.modalidade}
                            ${turma.etapa}
                        `
                            .toLowerCase()
                            .replace(/\s+/g, " ");


                        return texto.includes(
                            pesquisa
                                .toLowerCase()
                                .trim()
                        );
                    });

                return (

                    <div key={field.id}>
                        <hr />
                        <h3>
                            Destino: {
                                perfil === "ALUNO"
                                    ? "Alunos"
                                    : "Professores"
                            }
                        </h3>

                        <input
                            type="hidden"
                            {...register(
                                `destinos.${index}.perfil`
                            )}
                        />

                        {perfil === "ALUNO" && (
                            <>
                                <label>

                                    <input
                                        type="checkbox"
                                        checked={
                                            especificarAlunos
                                        }
                                        onChange={(event) =>
                                            alterarEspecificacaoAluno(
                                                index,
                                                event.target.checked
                                            )
                                        }
                                    />
                                    Adicionar especificações para alunos
                                </label>

                                {especificarAlunos && (
                                    <>
                                        <div>

                                            <h4>
                                                Modalidades
                                            </h4>

                                            <label>

                                                <input
                                                    type="checkbox"
                                                    value="MEDIO"
                                                    {...register(
                                                        `destinos.${index}.modalidades`
                                                    )}
                                                />
                                                Ensino Médio
                                            </label>

                                            <label>
                                                <input
                                                    type="checkbox"
                                                    value="TECNICO"
                                                    {...register(
                                                        `destinos.${index}.modalidades`
                                                    )}
                                                />
                                                Ensino Técnico
                                            </label>
                                        </div>

                                        <div>
                                            <h4>
                                                Etapas
                                            </h4>

                                            <label>

                                                <input
                                                    type="checkbox"
                                                    value="PRIMEIRA"
                                                    {...register(
                                                        `destinos.${index}.etapas`
                                                    )}
                                                />
                                                Primeiro
                                            </label>

                                            <label>
                                                <input
                                                    type="checkbox"
                                                    value="SEGUNDA"
                                                    {...register(
                                                        `destinos.${index}.etapas`
                                                    )}
                                                />
                                                Segundo
                                            </label>

                                            <label>
                                                <input
                                                    type="checkbox"
                                                    value="TERCEIRA"
                                                    {...register(
                                                        `destinos.${index}.etapas`
                                                    )}
                                                />
                                                Terceiro
                                            </label>
                                        </div>

                                        <div>

                                            <h4>
                                                Turmas
                                            </h4>

                                            <input
                                                type="text"
                                                placeholder="Pesquisar turma..."
                                                value={pesquisa}
                                                onChange={(event) =>
                                                    setPesquisa(
                                                        event.target.value
                                                    )
                                                }
                                            />
                                            <br />
                                            <br />

                                            {turmasFiltradas.map(
                                                (turma) => (
                                                    <div
                                                        key={turma.id}
                                                    >
                                                        <label>
                                                            <input
                                                                type="checkbox"
                                                                checked={
                                                                    turmasSelecionadas.includes(
                                                                        turma.id
                                                                    )
                                                                }
                                                                onChange={() =>
                                                                    selecionarTurma(
                                                                        index,
                                                                        turma.id
                                                                    )
                                                                }
                                                            />
                                                            {turma.cursoNome}
                                                            {" - "}
                                                            {turma.anoLetivo}
                                                            {" - "}
                                                            {turma.modalidade}
                                                            {" - "}
                                                            {turma.etapa}
                                                        </label>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </>
                                )}
                            </>
                        )}
                    </div>
                );
            })}
            <br />
            <br />

            <button type="submit">
                Salvar
            </button>
        </form>
    );
}