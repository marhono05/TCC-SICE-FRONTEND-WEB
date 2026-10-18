import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
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
import Aviso from "../../../components/ui/Aviso";
import Botao from "../../../components/ui/Botao";
import EtiquetaStatusEvento from "../../../components/eventos/EtiquetaStatusEvento";

const TELA_PEQUENA = "(max-width: 899px)";

function mesDaData(data: Date): string {
    return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}`;
}
type VistaDesktop = "dayGridMonth" | "listMonth";

const STATUS: { valor: StatusEvento; descricao: string }[] = [
    { valor: "ATIVO", descricao: "Ativos" },
    { valor: "CANCELADO", descricao: "Cancelados" },
];

function formatarData(data: string): string {
    const [ano, mes, dia] = data.split("-");
    return `${dia}/${mes}/${ano}`;
}

export default function EventosPage() {
    const navigate = useNavigate();
    const detalhesRef = useRef<HTMLDialogElement>(null);
    const calendarioRef = useRef<FullCalendar>(null);
    const ultimaVistaDesktopRef = useRef<VistaDesktop>("dayGridMonth");
    const [telaPequena, setTelaPequena] = useState(
        () => typeof window !== "undefined" && window.matchMedia(TELA_PEQUENA).matches
    );
    const { usuario } = useAuth();
    const podeGerenciar = usuario?.perfil === "ADMIN" || usuario?.perfil === "SECRETARIA";

    const [eventos, setEventos] = useState<Evento[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const [tentativa, setTentativa] = useState(0);
    const [statusVisiveis, setStatusVisiveis] = useState<StatusEvento[]>(["ATIVO", "CANCELADO"]);
    const [eventoSelecionadoId, setEventoSelecionadoId] = useState<number | null>(null);
    const [mesExibido, setMesExibido] = useState(() => mesDaData(new Date()));

    const recarregar = useCallback(() => setTentativa((atual) => atual + 1), []);

    // Mesmo ponto de quebra da sidebar: em telas pequenas, apenas a lista mensal.
    useEffect(() => {
        const mediaQuery = window.matchMedia(TELA_PEQUENA);
        const aoAlterarLargura = (evento: MediaQueryListEvent) => setTelaPequena(evento.matches);
        mediaQuery.addEventListener("change", aoAlterarLargura);
        return () => mediaQuery.removeEventListener("change", aoAlterarLargura);
    }, []);

    // initialView só vale na montagem; changeView também cobre redimensionamentos.
    useEffect(() => {
        const calendario = calendarioRef.current?.getApi();
        if (!calendario) return;
        const vistaPermitida = telaPequena ? "listMonth" : ultimaVistaDesktopRef.current;
        if (calendario.view.type !== vistaPermitida) {
            calendario.changeView(vistaPermitida);
        }
    }, [telaPequena, carregando]);

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
    const quantidadeNoMes = useMemo(
        () => eventosFiltrados.filter((evento) => evento.dataInicio.slice(0, 7) === mesExibido).length,
        [eventosFiltrados, mesExibido]
    );

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
        // Na grade mensal, ADMIN/SECRETARIA podem clicar no dia para cadastrar.
        const data = info.dateStr.slice(0, 10);
        navigate(`/cadastrarEventos?data=${encodeURIComponent(data)}`);
    }

    return (
        <main className="sice-calendario">
            <header className="sice-calendario__cabecalho">
                <div className="sice-calendario__identidade">
                    <span className="sice-calendario__icone-pagina" aria-hidden="true">
                        <i className="bi bi-calendar3" />
                    </span>
                    <div className="sice-calendario__titulos">
                        <h1>Calendário escolar</h1>
                        <p>{podeGerenciar
                            ? "Acompanhe os eventos da instituição. Selecione um dia na grade para cadastrar um novo evento."
                            : "Consulte os eventos destinados a você e veja os detalhes de cada um."}</p>
                    </div>
                </div>
                {podeGerenciar && (
                    <nav className="sice-calendario__acoes" aria-label="Gerenciamento dos eventos">
                        <Link className="sice-calendario__link sice-calendario__link--secundario" to="/gerenciarEventos">
                            <i className="bi bi-list-ul" aria-hidden="true" /> Gerenciar eventos
                        </Link>
                        <Link className="sice-calendario__link sice-calendario__link--primario" to="/cadastrarEventos">
                            <i className="bi bi-plus-lg" aria-hidden="true" /> Cadastrar evento
                        </Link>
                    </nav>
                )}
            </header>

            <section className="sice-calendario__painel" aria-labelledby="sice-calendario-filtros-titulo">
                <div className="sice-calendario__painel-topo">
                    <div>
                        <h2 id="sice-calendario-filtros-titulo"><i className="bi bi-funnel" aria-hidden="true" /> Filtrar eventos</h2>
                        <p>Escolha quais situações deseja visualizar no calendário.</p>
                    </div>
                </div>
                <fieldset className="sice-calendario__filtros">
                    <legend className="sice-calendario__legenda">Status dos eventos</legend>
                    {STATUS.map(({ valor, descricao }) => (
                        <label
                            key={valor}
                            className={`sice-calendario__filtro ${statusVisiveis.includes(valor) ? "sice-calendario__filtro--selecionado" : ""}`}
                        >
                            <input
                                type="checkbox"
                                checked={statusVisiveis.includes(valor)}
                                onChange={(e) => alternarStatus(valor, e.target.checked)}
                            />
                            <span className={`sice-calendario__indicador sice-calendario__indicador--${valor.toLowerCase()}`} aria-hidden="true" />
                            <span>{descricao}</span>
                        </label>
                    ))}
                </fieldset>
            </section>

            {erro && (
                <Aviso variante="erro" role="alert" titulo="Não foi possível carregar os eventos">
                    <p>{erro}</p>
                    <div className="sice-calendario__alerta-acoes">
                        <Botao type="button" variante="secundario" icone="bi-arrow-clockwise" onClick={recarregar}>Tentar novamente</Botao>
                    </div>
                </Aviso>
            )}

            {carregando ? (
                <div className="sice-calendario__carregando" role="status">
                    <i className="bi bi-hourglass-split" aria-hidden="true" /> Carregando eventos do calendário...
                </div>
            ) : !erro && (
                <section className="sice-calendario__painel sice-calendario__painel--agenda" aria-label="Agenda de eventos">
                    <div className="sice-calendario__resumo" role="status">
                        <div className="sice-calendario__resumo-identidade">
                            <span className="sice-calendario__resumo-icone" aria-hidden="true"><i className="bi bi-calendar-check" /></span>
                            <div>
                                <strong>{quantidadeNoMes} {quantidadeNoMes === 1 ? "evento neste mês" : "eventos neste mês"}</strong>
                                <p>Considerando os filtros selecionados.</p>
                            </div>
                        </div>
                        <span className="sice-calendario__resumo-vistas">
                            <i className={`bi ${telaPequena ? "bi-list-ul" : "bi-calendar3"}`} aria-hidden="true" />
                            {telaPequena ? "Lista mensal" : "Mês ou lista"}
                        </span>
                    </div>
                    <div className="sice-calendario__quadro">
                        <FullCalendar
                            ref={calendarioRef}
                            plugins={[dayGridPlugin, listPlugin, interactionPlugin]}
                            locale={ptBrLocale}
                            initialView={telaPequena ? "listMonth" : "dayGridMonth"}
                            headerToolbar={{
                                left: telaPequena ? "prev,next" : "prev,next today",
                                center: "title",
                                right: telaPequena ? "today" : "dayGridMonth,listMonth",
                            }}
                            buttonText={{ month: "Mês", list: "Lista", today: "Hoje" }}
                            noEventsContent="Nenhum evento encontrado neste mês."
                            datesSet={({ view }) => {
                                const mesAtual = mesDaData(view.currentStart);
                                setMesExibido((anterior) => anterior === mesAtual ? anterior : mesAtual);
                            }}
                            viewDidMount={({ view }) => {
                                if (!telaPequena && (view.type === "dayGridMonth" || view.type === "listMonth")) {
                                    ultimaVistaDesktopRef.current = view.type;
                                }
                            }}
                            events={eventosCalendario}
                            eventClick={selecionarEvento}
                            dateClick={podeGerenciar ? escolherDia : undefined}
                            eventTimeFormat={{ hour: "2-digit", minute: "2-digit", hour12: false }}
                            dayMaxEvents={3}
                            displayEventTime
                            nowIndicator
                            height="auto"
                            editable={false}
                            eventDidMount={({ el, event }) => {
                                el.title = `${event.title} — ${event.extendedProps.status ?? ""}`;
                            }}
                        />
                    </div>
                    <p className="sice-calendario__nota">
                        <i className="bi bi-info-circle" aria-hidden="true" />
                        Os horários indicam o início dos eventos. O SICE ainda não registra horário de término.
                    </p>
                </section>
            )}

            <dialog
                ref={detalhesRef}
                className="sice-calendario__dialog"
                aria-labelledby="titulo-evento-selecionado"
                aria-describedby="sice-calendario-detalhe-texto"
                onClose={() => setEventoSelecionadoId(null)}
            >
                {eventoSelecionado && (
                    <article className="sice-calendario__detalhe">
                        <div className="sice-calendario__detalhe-topo">
                            <span className="sice-calendario__detalhe-icone" aria-hidden="true"><i className="bi bi-calendar-event" /></span>
                            <div className="sice-calendario__detalhe-titulos">
                                <span className="sice-calendario__detalhe-sobretitulo">Evento escolar</span>
                                <h2 id="titulo-evento-selecionado">{eventoSelecionado.titulo}</h2>
                            </div>
                            <button
                                type="button"
                                className="sice-calendario__dialog-fechar"
                                onClick={() => detalhesRef.current?.close()}
                                aria-label="Fechar detalhes do evento"
                            ><i className="bi bi-x-lg" aria-hidden="true" /></button>
                        </div>
                        <div className="sice-calendario__detalhe-status">
                            <EtiquetaStatusEvento status={eventoSelecionado.status} />
                        </div>
                        <dl className="sice-calendario__dados">
                            <div className="sice-calendario__dado">
                                <dt><i className="bi bi-calendar3" aria-hidden="true" /> Data</dt>
                                <dd>{formatarData(eventoSelecionado.dataInicio)}</dd>
                            </div>
                            <div className="sice-calendario__dado">
                                <dt><i className="bi bi-clock" aria-hidden="true" /> Horário</dt>
                                <dd>{eventoSelecionado.horaInicio.slice(0, 5)}</dd>
                            </div>
                        </dl>
                        <section className="sice-calendario__descricao">
                            <h3>Descrição</h3>
                            <p id="sice-calendario-detalhe-texto">{eventoSelecionado.descricao}</p>
                        </section>
                        <footer className="sice-calendario__detalhe-acoes">
                            {podeGerenciar && (
                                <>
                                    <Link className="sice-calendario__link sice-calendario__link--secundario" to={`/eventos/${eventoSelecionado.id}`}>
                                        <i className="bi bi-eye" aria-hidden="true" /> Ver detalhes completos
                                    </Link>
                                    <Link className="sice-calendario__link sice-calendario__link--primario" to={`/editarEventos/${eventoSelecionado.id}`}>
                                        <i className="bi bi-pencil-square" aria-hidden="true" /> Editar evento
                                    </Link>
                                </>
                            )}
                            <form method="dialog" className="sice-calendario__fechar-rodape">
                                <Botao type="submit" variante="secundario" icone="bi-x-lg">Fechar</Botao>
                            </form>
                        </footer>
                    </article>
                )}
            </dialog>
        </main>
    );
}
