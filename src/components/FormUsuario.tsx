import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import type { Usuario } from "../types/usuario";
import type { Turma } from "../types/turmas";
import type { PerfilUsuario } from "../schemas/perfilUsuarioSchema";

import {
    usuarioSchema,
    type UsuarioFormData
} from "../schemas/usuarioSchema";


type FormUsuarioProps = {
    usuario?: Usuario;
    perfil: PerfilUsuario;
    turmas: Turma[];
    onSubmit: (dados: UsuarioFormData) => Promise<void> | void;
};


export default function FormUsuario({
    usuario,
    perfil,
    turmas,
    onSubmit
}: FormUsuarioProps) {

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        reset,
        formState: { errors }
    } = useForm<UsuarioFormData>({
        resolver: zodResolver(usuarioSchema),

        defaultValues: {
            identificador: usuario?.identificador ?? "",
            nome: usuario?.nome ?? "",
            email: usuario?.email ?? "",
            perfil,
            turmasIds:
                perfil === "ALUNO"
                    ? usuario?.turmasIds ?? []
                    : []
        }
    });


    const [pesquisa, setPesquisa] =
        useState("");


    const turmasSelecionadas =
        watch("turmasIds") ?? [];

        
    /*
     * Importante para edição ou caso o perfil/usuário
     * seja carregado depois da primeira renderização.
     */
    useEffect(() => {

        reset({
            identificador: usuario?.identificador ?? "",
            nome: usuario?.nome ?? "",
            email: usuario?.email ?? "",
            perfil,
            turmasIds:
                perfil === "ALUNO"
                    ? usuario?.turmasIds ?? []
                    : []
        });

    }, [usuario, perfil, reset]);


    /*
     * Caso não seja aluno, garantimos que
     * nenhuma turma fique selecionada.
     */
    useEffect(() => {

        if (perfil !== "ALUNO") {

            setValue(
                "turmasIds",
                [],
                {
                    shouldValidate: true
                }
            );

        }

    }, [perfil, setValue]);


    const turmasFiltradas =
        turmas.filter((turma) => {

            const texto = `
                ${turma.cursoNome}
                ${turma.etapa}
                ${turma.modalidade}
                ${turma.anoLetivo}
            `
                .toLowerCase()
                .replace(/\s+/g, " ");


            return texto.includes(
                pesquisa
                    .toLowerCase()
                    .trim()
            );
        });


    function selecionarTurma(
        turmaId: number
    ) {

        const estaSelecionada =
            turmasSelecionadas.includes(
                turmaId
            );


        if (estaSelecionada) {

            setValue(
                "turmasIds",
                turmasSelecionadas.filter(
                    (id) => id !== turmaId
                ),
                {
                    shouldValidate: true
                }
            );

        } else {

            setValue(
                "turmasIds",
                [
                    ...turmasSelecionadas,
                    turmaId
                ],
                {
                    shouldValidate: true
                }
            );

        }
    }


    return (

        <form onSubmit={handleSubmit(onSubmit)}>

            {/* PERFIL */}

            {/*
                O perfil não precisa aparecer como campo
                editável porque ele já vem da rota/página.
            */}

            <input
                type="hidden"
                {...register("perfil")}
            />


            {/* NOME */}

            <label>
                Nome:
            </label>

            <input
                type="text"
                placeholder="Digite o nome do usuário..."
                {...register("nome")}
            />

            {errors.nome && (
                <span>
                    {errors.nome.message}
                </span>
            )}

            <br />
            <br />


            {/* EMAIL */}

            <label>
                E-mail:
            </label>

            <input
                type="email"
                placeholder="Digite o e-mail do usuário..."
                {...register("email")}
            />

            {errors.email && (
                <span>
                    {errors.email.message}
                </span>
            )}

            <br />
            <br />


            {/* IDENTIFICADOR */}

            <label>
                Identificador:
            </label>

            <input
                type="text"
                placeholder="Digite o identificador do usuário..."
                {...register("identificador")}
            />

            {errors.identificador && (
                <span>
                    {errors.identificador.message}
                </span>
            )}

            <br />
            <br />


            {/* TURMAS - SOMENTE ALUNO */}

            {perfil === "ALUNO" && (

                <div>

                    <h3>
                        Turmas
                    </h3>


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

                            <div key={turma.id}>

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
                                                turma.id
                                            )
                                        }
                                    />


                                    {turma.cursoNome}
                                    {" - "}
                                    {turma.etapa}
                                    {" - "}
                                    {turma.modalidade}
                                    {" - "}
                                    {turma.anoLetivo}

                                </label>

                            </div>

                        )
                    )}


                    {errors.turmasIds && (
                        <span>
                            {errors.turmasIds.message}
                        </span>
                    )}

                </div>

            )}


            <br />
            <br />


            <button type="submit">
                Salvar
            </button>

        </form>

    );
}