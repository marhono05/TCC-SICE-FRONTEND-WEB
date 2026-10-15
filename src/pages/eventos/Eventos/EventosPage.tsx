import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import ptBrLocale from "@fullcalendar/core/locales/pt-br";
import type { DateClickArg } from "@fullcalendar/interaction";
import type { EventClickArg } from "@fullcalendar/core";
import { Link, useNavigate } from "react-router";

import { useAuth } from "../../../hooks/useAuth";
import { listarMeusEventos, listarTodos } from "../../../services/eventoService";
import type { Evento } from "../../../types/evento";
import type { StatusEvento } from "../../../schemas/eventoSchema";
import { mensagemErroApi } from "../../../utils/erroApi";
import "./EventosPage.css";
import { converterEventosParaCalendario } from "../../../utils/calendarioEventos";

const STATUS: { valor: StatusEvento; descricao: string }[] = [
    { valor: "ATIVO", descricao: "Ativos" },
    { valor: "CANCELADO", descricao: "Cancelados" },
    { valor: "DESATIVADO", descricao: "Desativados" },
];

function formatarData(data: string): string {
    const [ano, mes, dia] = data.split("-");
    return `${dia}/${mes}/${ano}`;
}

export default function EventosPage() {
    const navigate = useNavigate();
    const detalhesRef = useRef<HTMLDialogElement>(null);
    const { usuario } = useAuth();
    const podeGerenciar = usuario?.perfil === "ADMIN" || usuario?.perfil === "SECRETARIA";

    const [eventos, setEventos] = useState<Evento[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const [tentativa, setTentativa] = useState(0);
    const [statusVisiveis, setStatusVisiveis] = useState<StatusEvento[]>(["ATIVO", "CANCELADO", "DESATIVADO"]);
    const [eventoSelecionadoId, setEventoSelecionadoId] = useState<number | null>(null);

    const recarregar = useCallback(() => setTentativa((atual) => atual + 1), []);

    useEffect(() => {
        let ativo = true;

        async function carregarEventos() {
            setCarregando(true);
            setErro("");
            setEventoSelecionadoId(null);
            try {
                const resposta = podeGerenciar ? await listarTodos() : await listarMeusEventos();
                if (ativo) setEventos(resposta);
            } catch (falha) {
                if (ativo) {
                    setEventos([]);
                    setErro(mensagemErroApi(falha, "Não foi possível carregar o calendário."));
                }
            } finally {
                if (ativo) setCarregando(false);
            }
        }

        void carregarEventos();
        return () => { ativo = false; };
    }, [podeGerenciar, tentativa]);

    const eventosFiltrados = useMemo(
        () => eventos.filter((evento) => statusVisiveis.includes(evento.status)),
        [eventos, statusVisiveis]
    );
    const eventosCalendario = useMemo(
        () => converterEventosParaCalendario(eventosFiltrados),
        [eventosFiltrados]
    );
    const eventoSelecionado = eventosFiltrados.find((evento) => evento.id === eventoSelecionadoId) ?? null;

    function alternarStatus(status: StatusEvento, visivel: boolean) {
        setStatusVisiveis((atuais) => visivel
            ? [...atuais.filter((item) => item !== status), status]
            : atuais.filter((item) => item !== status)
        );
    }

    function selecionarEvento(info: EventClickArg) {
        info.jsEvent.preventDefault();
        setEventoSelecionadoId(Number(info.event.id));
        detalhesRef.current?.showModal();
    }

    function escolherDia(info: DateClickArg) {
        if (!podeGerenciar) return;
        // Também funciona quando o clique é feito na visualização semanal.
        const data = info.dateStr.slice(0, 10);
        navigate(`/cadastrarEventos?data=${encodeURIComponent(data)}`);
    }

    return (
        <main className="sice-calendario">
            <div className="sice-calendario__cabecalho">
                <div>
                    <h1>Calendário escolar</h1>
                    <p>{podeGerenciar
                        ? "Acompanhe todos os eventos e selecione um dia para cadastrar um novo."
                        : "Veja os eventos destinados a você e consulte seus detalhes."}</p>
                </div>
                {podeGerenciar && (
                    <div className="sice-calendario__acoes">
                        <Link to="/gerenciarEventos">Gerenciar eventos</Link>
                        <Link to="/cadastrarEventos">Cadastrar evento</Link>
                    </div>
                )}
            </div>

            <fieldset className="sice-calendario__filtros">
                <legend>Status dos eventos</legend>
                {STATUS.filter(({ valor }) => podeGerenciar || valor !== "DESATIVADO").map(({ valor, descricao }) => (
                    <label key={valor} className="sice-calendario__filtro">
                        <input
                            type="checkbox"
                            checked={statusVisiveis.includes(valor)}
                            onChange={(e) => alternarStatus(valor, e.target.checked)}
                        />
                        <span className={`sice-calendario__indicador sice-calendario__indicador--${valor.toLowerCase()}`} />
                        {descricao}
                    </label>
                ))}
            </fieldset>

            {erro && (
                <div role="alert" className="sice-calendario__alerta">
                    <p>{erro}</p>
                    <button type="button" onClick={recarregar}>Tentar novamente</button>
                </div>
            )}

            {carregando ? (
                <p role="status">Carregando eventos do calendário...</p>
            ) : !erro && (
                <>
                    <p className="sice-calendario__contagem" role="status">
                        {eventosFiltrados.length} {eventosFiltrados.length === 1 ? "evento exibido" : "eventos exibidos"}.
                        {eventosFiltrados.length === 0 && " Não há eventos com os filtros selecionados."}
                    </p>
                    <div className="sice-calendario__quadro">
                        <FullCalendar
                            plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
                            locale={ptBrLocale}
                            initialView="dayGridMonth"
                            headerToolbar={{
                                left: "prev,next today",
                                center: "title",
                                right: "dayGridMonth,timeGridWeek,listWeek",
                            }}
                            buttonText={{ month: "Mês", week: "Semana", list: "Lista", today: "Hoje" }}
                            events={eventosCalendario}
                            eventClick={selecionarEvento}
                            dateClick={podeGerenciar ? escolherDia : undefined}
                            eventTimeFormat={{ hour: "2-digit", minute: "2-digit", hour12: false }}
                            dayMaxEvents={3}
                            displayEventTime
                            allDaySlot={false}
                            nowIndicator
                            height="auto"
                            editable={false}
                            eventDidMount={({ el, event }) => {
                                el.title = `${event.title} — ${event.extendedProps.status ?? ""}`;
                            }}
                        />
                    </div>
                    <p className="sice-calendario__nota">Os horários representam o início dos eventos. O SICE ainda não registra horário de término.</p>

                    <dialog
                        ref={detalhesRef}
                        className="sice-calendario__dialog"
                        aria-labelledby="titulo-evento-selecionado"
                        onClose={() => setEventoSelecionadoId(null)}
                    >
                        {eventoSelecionado && (
                            <section className="sice-calendario__detalhe">
                                <h2 id="titulo-evento-selecionado">{eventoSelecionado.titulo}</h2>
                                <p><strong>Data:</strong> {formatarData(eventoSelecionado.dataInicio)}</p>
                                <p><strong>Horário:</strong> {eventoSelecionado.horaInicio.slice(0, 5)}</p>
                                <p><strong>Status:</strong> {eventoSelecionado.status}</p>
                                <p><strong>Descrição:</strong> {eventoSelecionado.descricao}</p>
                                {podeGerenciar && (
                                    <div className="sice-calendario__acoes">
                                        <Link to={`/eventos/${eventoSelecionado.id}`}>Ver detalhes completos</Link>
                                        <Link to={`/editarEventos/${eventoSelecionado.id}`}>Editar evento</Link>
                                    </div>
                                )}
                            </section>
                        )}
                        <form method="dialog">
                            <button type="submit">Fechar</button>
                        </form>
                    </dialog>
                </>
            )}
        </main>
    );
}
