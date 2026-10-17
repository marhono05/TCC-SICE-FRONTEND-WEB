import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cursoSchema, type CursoFormData } from "../../schemas/cursoSchema";
import type { Curso } from "../../types/curso";
import CampoFormulario from "../ui/CampoFormulario";
import SecaoFormulario from "../ui/SecaoFormulario";
import Botao from "../ui/Botao";
import "./FormCurso.css";

interface FormCursoProps {
    curso?: Curso;
    salvando?: boolean;
    onSubmit: (dados: CursoFormData) => Promise<void> | void;
}

export default function FormCurso({ curso, onSubmit, salvando = false }: FormCursoProps) {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm<CursoFormData>({
        resolver: zodResolver(cursoSchema),
        defaultValues: { nome: curso?.nome ?? "" }
    });

    useEffect(() => {
        if (curso) reset({ nome: curso.nome });
    }, [curso, reset]);

    return (
        <form className="sice-curso-form" onSubmit={handleSubmit(onSubmit)}>
            <fieldset className="sice-curso-form__fieldset" disabled={salvando}>
                <SecaoFormulario
                    id="curso-secao-dados"
                    titulo="Dados do curso"
                    descricao="Identifique o curso que será associado às turmas da instituição."
                    icone="bi-book"
                >
                    <CampoFormulario
                        id="curso-nome"
                        rotulo="Nome do curso"
                        obrigatorio
                        erro={errors.nome?.message}
                    >
                        <input
                            id="curso-nome"
                            type="text"
                            className="sice-campo__controle"
                            placeholder="Digite o nome do curso..."
                            aria-invalid={Boolean(errors.nome)}
                            aria-describedby={errors.nome ? "curso-nome-erro" : undefined}
                            {...register("nome")}
                        />
                    </CampoFormulario>
                </SecaoFormulario>
                <div className="sice-curso-form__acoes">
                    <Botao type="submit" icone="bi-check-lg" disabled={salvando}>
                        {salvando ? "Salvando..." : "Salvar curso"}
                    </Botao>
                </div>
            </fieldset>
        </form>
    );
}
