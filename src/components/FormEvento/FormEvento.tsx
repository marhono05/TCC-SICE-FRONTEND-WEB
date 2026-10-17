import { useEffect, useState } from "react";
import {
    useFieldArray,
    useForm,
    useWatch
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Evento } from "../../types/evento";
import { eventoSchema, type EventoFormData, type PerfilDestinacao} from "../../schemas/eventoSchema";
import type { Turma } from "../../types/turmas";
import AlertaGruposEvento from "../AlertaGrupoEvento/AlertaGruposEvento";
import CampoFormulario from "../ui/CampoFormulario";
import Botao from "../ui/Botao";
import "./FormEvento.css";

type EventoFormProps = {
    evento?: Evento;
    dataInicial?: string;
    turmas: Turma[];
    onSubmit: (dados: EventoFormData) => Promise<void>;
    salvando?: boolean;
};

export default function FormEvento({
    evento,
    dataInicial,
    turmas,
    onSubmit,
    salvando = false
}: EventoFormProps) {

    const {
        register,
        control,
        handleSubmit,
        setValue,
        getValues,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<EventoFormData>({
        resolver: zodResolver(eventoSchema),

        defaultValues: {
            titulo: evento?.titulo ?? "",
            descricao: evento?.descricao ?? "",
            dataInicio: evento?.dataInicio ?? dataInicial ?? "",
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

    // Ao editar, o formulário já recebe o evento carregado. A seleção inicial
    // pode ser calculada aqui, sem atualizar o estado dentro de um efeito.
    const [
        especificarAlunos,
        setEspecificarAlunos
    ] = useState(() => evento?.destinos.some(
        (destino) => destino.perfil === "ALUNO" && (
            destino.etapas.length > 0 ||
            destino.modalidades.length > 0 ||
            destino.turmasIds.length > 0
        )
    ) ?? false);

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


    }, [evento, reset]);


    const destinos = useWatch({ control, name: "destinos" }) ?? [];

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
        <form className="sice-evento-form" onSubmit={handleSubmit(onSubmit)}>
            <fieldset className="sice-evento-form__fieldset" disabled={salvando || isSubmitting}>
                <section className="sice-evento-form__secao" aria-labelledby="evento-secao-informacoes">
                    <div className="sice-evento-form__cabecalho">
                        <span className="sice-evento-form__icone"><i className="bi bi-calendar-event" aria-hidden="true" /></span>
                        <div>
                            <h2 id="evento-secao-informacoes">Informações do evento</h2>
                            <p>Preencha o título, a descrição, a data e o horário.</p>
                        </div>
                    </div>
                    <div className="sice-evento-form__grade">
                        <CampoFormulario id="evento-titulo" rotulo="Título do evento" obrigatorio
                            erro={errors.titulo?.message} className="sice-evento-form__coluna-inteira">
                            <input id="evento-titulo" type="text" className="sice-campo__controle"
                                placeholder="Ex.: Reunião de pais"
                                aria-invalid={Boolean(errors.titulo)}
                                aria-describedby={errors.titulo ? "evento-titulo-erro" : undefined}
                                {...register("titulo")} />
                        </CampoFormulario>
                        <CampoFormulario id="evento-descricao" rotulo="Descrição" obrigatorio
                            erro={errors.descricao?.message} className="sice-evento-form__coluna-inteira">
                            <textarea id="evento-descricao" className="sice-campo__controle" rows={4}
                                placeholder="Descreva o evento escolar..."
                                aria-invalid={Boolean(errors.descricao)}
                                aria-describedby={errors.descricao ? "evento-descricao-erro" : undefined}
                                {...register("descricao")} />
                        </CampoFormulario>
                        <CampoFormulario id="evento-data" rotulo="Data do evento" obrigatorio
                            erro={errors.dataInicio?.message}>
                            <input id="evento-data" type="date" className="sice-campo__controle"
                                aria-invalid={Boolean(errors.dataInicio)}
                                aria-describedby={errors.dataInicio ? "evento-data-erro" : undefined}
                                {...register("dataInicio")} />
                        </CampoFormulario>
                        <CampoFormulario id="evento-hora" rotulo="Horário" obrigatorio
                            erro={errors.horaInicio?.message}>
                            <input id="evento-hora" type="time" className="sice-campo__controle"
                                aria-invalid={Boolean(errors.horaInicio)}
                                aria-describedby={errors.horaInicio ? "evento-hora-erro" : undefined}
                                {...register("horaInicio")} />
                        </CampoFormulario>
                    </div>
                </section>

                <section className="sice-evento-form__secao" aria-labelledby="evento-secao-destinatarios">
                    <div className="sice-evento-form__cabecalho">
                        <span className="sice-evento-form__icone"><i className="bi bi-people" aria-hidden="true" /></span>
                        <div>
                            <h2 id="evento-secao-destinatarios">Destinatários</h2>
                            <p>Selecione os públicos que deverão receber o aviso do evento.</p>
                        </div>
                    </div>
                    <div className="sice-evento-form__opcoes" role="group" aria-label="Públicos destinatários">
                        <label className="sice-evento-form__opcao">
                            <input type="checkbox" checked={perfilSelecionado("ALUNO")}
                                onChange={(event) => selecionarPerfil("ALUNO", event.target.checked)} />
                            <i className="bi bi-mortarboard" aria-hidden="true" />
                            Alunos
                        </label>
                        <label className="sice-evento-form__opcao">
                            <input type="checkbox" checked={perfilSelecionado("PROFESSOR")}
                                onChange={(event) => selecionarPerfil("PROFESSOR", event.target.checked)} />
                            <i className="bi bi-person-workspace" aria-hidden="true" />
                            Professores
                        </label>
                    </div>
                    {errors.destinos?.message && (
                        <p className="sice-campo__erro" role="alert">{errors.destinos.message}</p>
                    )}
                    {fields.map((field, index) => {
                        const destino = destinos[index];
                        const perfil = destino?.perfil ?? field.perfil;
                        const turmasSelecionadas = destino?.turmasIds ?? [];
                        const turmasFiltradas = turmas.filter((turma) => {
                            const texto = `${turma.cursoNome} ${turma.anoLetivo} ${turma.modalidade} ${turma.etapa}`
                                .toLowerCase().replace(/\s+/g, " ");
                            return texto.includes(pesquisa.toLowerCase().trim());
                        });
                        return (
                            <div className="sice-evento-form__destino" key={field.id}>
                                <h3>Destino: {perfil === "ALUNO" ? "Alunos" : "Professores"}</h3>
                                <input type="hidden" {...register(`destinos.${index}.perfil`)} />
                                {perfil === "ALUNO" && (
                                    <>
                                        <label className="sice-evento-form__opcao">
                                            <input type="checkbox" checked={especificarAlunos}
                                                onChange={(event) => alterarEspecificacaoAluno(index, event.target.checked)} />
                                            <span>Adicionar especificações para alunos</span>
                                        </label>
                                        {especificarAlunos && (
                                            <>
                                                <div className="sice-evento-form__filtros">
                                                    <div className="sice-evento-form__grupo" role="group" aria-label="Modalidades">
                                                        <h4>Modalidades</h4>
                                                        <div className="sice-evento-form__opcoes sice-evento-form__opcoes--coluna">
                                                            <label className="sice-evento-form__opcao">
                                                                <input type="checkbox" value="MEDIO"
                                                                    {...register(`destinos.${index}.modalidades`)} />
                                                                Ensino Médio
                                                            </label>
                                                            <label className="sice-evento-form__opcao">
                                                                <input type="checkbox" value="TECNICO"
                                                                    {...register(`destinos.${index}.modalidades`)} />
                                                                Ensino Técnico
                                                            </label>
                                                        </div>
                                                    </div>
                                                    <div className="sice-evento-form__grupo" role="group" aria-label="Etapas">
                                                        <h4>Etapas</h4>
                                                        <div className="sice-evento-form__opcoes sice-evento-form__opcoes--coluna">
                                                            <label className="sice-evento-form__opcao">
                                                                <input type="checkbox" value="PRIMEIRA"
                                                                    {...register(`destinos.${index}.etapas`)} />
                                                                Primeiro
                                                            </label>
                                                            <label className="sice-evento-form__opcao">
                                                                <input type="checkbox" value="SEGUNDA"
                                                                    {...register(`destinos.${index}.etapas`)} />
                                                                Segundo
                                                            </label>
                                                            <label className="sice-evento-form__opcao">
                                                                <input type="checkbox" value="TERCEIRA"
                                                                    {...register(`destinos.${index}.etapas`)} />
                                                                Terceiro
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="sice-evento-form__grupo">
                                                    <h4>Turmas</h4>
                                                    <p>Pesquise e marque as turmas desejadas.</p>
                                                    <CampoFormulario id="evento-busca-turmas" rotulo="Pesquisar turma">
                                                        <input id="evento-busca-turmas" type="search"
                                                            className="sice-campo__controle" placeholder="Curso, ano ou etapa..."
                                                            value={pesquisa}
                                                            onChange={(event) => setPesquisa(event.target.value)} />
                                                    </CampoFormulario>
                                                    <div className="sice-evento-form__lista-turmas" role="group" aria-label="Turmas disponíveis">
                                                        {turmasFiltradas.length === 0 && (
                                                            <p className="sice-evento-form__sem-turmas">Nenhuma turma encontrada.</p>
                                                        )}
                                                        {turmasFiltradas.map((turma) => (
                                                            <label key={turma.id} className={`sice-evento-form__turma ${!turma.ativo ? "sice-evento-form__turma--inativa" : ""}`}>
                                                                <input type="checkbox" checked={turmasSelecionadas.includes(turma.id)}
                                                                    onChange={() => selecionarTurma(index, turma.id)} />
                                                                <span>{turma.cursoNome} — {turma.anoLetivo} — {turma.modalidade} — {turma.etapa}{!turma.ativo && " (inativa)"}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </>
                                )}
                            </div>
                        );
                    })}
                </section>

                <div className="sice-evento-form__alerta">
                    <AlertaGruposEvento destinos={destinos} turmas={turmas} />
                </div>
                <div className="sice-evento-form__acoes">
                    <Botao type="submit" icone="bi-check-lg">
                        {salvando || isSubmitting ? "Salvando..." : "Salvar evento"}
                    </Botao>
                </div>
            </fieldset>
        </form>
    );
}
