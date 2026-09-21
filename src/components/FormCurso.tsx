import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import type { Curso } from "../types/curso";
import {
    cursoSchema,
    type CursoFormData
} from "../schemas/cursoSchema";


interface FormCursoProps {
    curso?: Curso;
    onSubmit: (dados: CursoFormData) => Promise<void> | void;
}


export default function FormCurso({
    curso,
    onSubmit
}: FormCursoProps) {

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm<CursoFormData>({
        resolver: zodResolver(cursoSchema),

        defaultValues: {
            nome: curso?.nome ?? ""
        }
    });


    /*
     * Importante principalmente para edição:
     * se o curso vier da API depois que o
     * componente já foi renderizado.
     */
    useEffect(() => {

        if (curso) {
            reset({
                nome: curso.nome
            });
        }

    }, [curso, reset]);


    return (

        <form onSubmit={handleSubmit(onSubmit)}>

            <label>
                Nome:
            </label>

            <input
                type="text"
                placeholder="Digite o nome do curso"
                {...register("nome")}
            />


            {errors.nome && (
                <span>
                    {errors.nome.message}
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