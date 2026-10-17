import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router";
import Aviso from "../../../../components/ui/Aviso";
import Botao from "../../../../components/ui/Botao";
import CabecalhoListagem from "../../../../components/ui/CabecalhoListagem";
import CampoPesquisa from "../../../../components/ui/CampoPesquisa";
import EtiquetaStatusEvento from "../../../../components/ui/EtiquetaStatusEvento";
import ConfirmarCancelamentoEvento from "../../../../components/ConfirmarCancelamento/ConfirmarCancelamentoEvento";
import type { Evento } from "../../../../types/evento";
import { listarTodos, reativarEvento, desativarEvento } from "../../../../services/eventoService";
import { mensagemErroApi } from "../../../../utils/erroApi";
import { normalizarPesquisaListagem } from "../../../../utils/pesquisaListagem";
import "../../../../components/ui/listagem-ui.css";
import "../../../../components/ui/listagem-grupos-eventos.css";

type AcaoEvento = "desativar" | "reativar";

const situacaoPesquisa: Record<Evento["status"], string> = {
    ATIVO: "ativo",
    CANCELADO: "cancelado",
    DESATIVADO: "desativado",
};

/** Formatação textual de data ISO, sem converter fuso horário. */
function apresentarData(data: string) {
    const partes = data.split("-");
    return partes.length === 3 ? `${partes[2]}/${partes[1]}/${partes[0]}` : data;
}

function rotuloDestinos(evento: Evento) {
    return evento.destinos.map((destino) =>
        destino.perfil === "ALUNO" ? "Alunos" : "Professores",
    ).join(", ") || "—";
}

type AcoesEventoProps = {
    evento: Evento;
    processandoId: number | null;
    dataHoje: string;
    aoCancelar: (evento: Evento) => void;
    aoAlterarStatus: (evento: Evento, acao: AcaoEvento) => Promise<void>;
};

/** Compartilha regras e ações entre tabela e cartões mobile. */
function AcoesEvento({ evento, processandoId, dataHoje, aoCancelar, aoAlterarStatus }: AcoesEventoProps) {
    return (
        <div className="sice-listagem__acoes sice-listagem__acoes--eventos">
            <Link to={`/eventos/${evento.id}`} className="sice-listagem__link-acao">
                <i className="bi bi-eye" aria-hidden="true" />
                Ver
            </Link>
            <Link to={`/editarEventos/${evento.id}`} className="sice-listagem__link-acao">
                <i className="bi bi-pencil-square" aria-hidden="true" />
                Editar
            </Link>
            <Botao
                type="button"
                variante="perigo"
                icone="bi-x-circle"
                className="sice-listagem__botao-acao"
                aria-label={`Cancelar evento ${evento.titulo}`}
                disabled={processandoId !== null || evento.status !== "ATIVO"}
                onClick={() => aoCancelar(evento)}
            >
                Cancelar
            </Botao>
            <Botao
                type="button"
                variante="secundario"
                icone="bi-slash-circle"
                className="sice-listagem__botao-acao"
                aria-label={`Desativar evento ${evento.titulo}`}
                disabled={processandoId !== null || evento.status === "DESATIVADO"}
                onClick={() => void aoAlterarStatus(evento, "desativar")}
            >
                Desativar
            </Botao>
            <Botao
                type="button"
                variante="secundario"
                icone="bi-arrow-counterclockwise"
                className="sice-listagem__botao-acao"
                aria-label={`Reativar evento ${evento.titulo}`}
                disabled={processandoId !== null || evento.status === "ATIVO" || evento.dataInicio < dataHoje}
                onClick={() => void aoAlterarStatus(evento, "reativar")}
            >
                Reativar
            </Botao>
            {processandoId === evento.id && <span role="status" className="sice-listagem__acao-aguardando">Atualizando...</span>}
        </div>
    );
}

export default function ListarEventosPage() {
    const location = useLocation();
    const avisoNavegacao = (location.state as { aviso?: string } | null)?.aviso;
    const [loading, setLoading] = useState(true);
    const [eventos, setEventos] = useState<Evento[]>([]);
    const [erro, setErro] = useState("");
    const [erroAcao, setErroAcao] = useState("");
    const [aviso, setAviso] = useState(avisoNavegacao ?? "");
    const [pesquisa, setPesquisa] = useState("");
    const [processandoId, setProcessandoId] = useState<number | null>(null);
    const [eventoParaCancelar, setEventoParaCancelar] = useState<Evento | null>(null);
    const [ultimoCanceladoId, setUltimoCanceladoId] = useState<number | null>(null);

    const buscarEventos = useCallback(async () => {
        try {
            const dados = await listarTodos();
            setEventos(dados);
        } catch (falha) {
            setErro(mensagemErroApi(falha, "Não foi possível listar os eventos."));
        } finally {
            setLoading(false);
        }
    }, []);

    const carregarEventos = useCallback(async () => {
        setLoading(true);
        setErro("");
        await buscarEventos();
    }, [buscarEventos]);

    // Na montagem, só atualiza estado após o resultado da API; ignora respostas após desmontagem.
    useEffect(() => {
        let ativo = true;
        void listarTodos()
            .then((dados) => {
                if (ativo) setEventos(dados);
            })
            .catch((falha) => {
                if (ativo) setErro(mensagemErroApi(falha, "Não foi possível listar os eventos."));
            })
            .finally(() => {
                if (ativo) setLoading(false);
            });
        return () => { ativo = false; };
    }, []);

    const eventosFiltrados = useMemo(() => {
        const termo = normalizarPesquisaListagem(pesquisa.trim());
        if (!termo) return eventos;
        return eventos.filter((evento) => normalizarPesquisaListagem([
            evento.id,
            evento.titulo,
            evento.descricao,
            evento.dataInicio,
            apresentarData(evento.dataInicio),
            evento.horaInicio.slice(0, 5),
            evento.status,
            situacaoPesquisa[evento.status],
            rotuloDestinos(evento),
        ].join(" ")).includes(termo));
    }, [eventos, pesquisa]);

    async function executarAcao(evento: Evento, acao: AcaoEvento) {
        if (processandoId !== null) return;
        const confirmacao = acao === "desativar"
            ? "Deseja desativar este evento?"
            : "Deseja reativar este evento?";
        if (!window.confirm(confirmacao)) return;

        setErroAcao("");
        setAviso("");
        setUltimoCanceladoId(null);
        setProcessandoId(evento.id);
        try {
            const atualizado = acao === "desativar"
                ? await desativarEvento(evento.id)
                : await reativarEvento(evento.id);
            setEventos((atuais) => atuais.map((item) => item.id === atualizado.id ? atualizado : item));
            setAviso(`Evento ${acao === "desativar" ? "desativado" : "reativado"} com sucesso.`);
        } catch (falha) {
            setErroAcao(mensagemErroApi(falha, "Não foi possível alterar o status do evento."));
        } finally {
            setProcessandoId(null);
        }
    }

    const iniciarCancelamento = (evento: Evento) => {
        setErroAcao("");
        setAviso("");
        setUltimoCanceladoId(null);
        setEventoParaCancelar(evento);
    };

    const hoje = new Date();
    const dataHoje = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}-${String(hoje.getDate()).padStart(2, "0")}`;
    const total = eventos.length;
    const exibidos = eventosFiltrados.length;
    const possuiResultados = !loading && !erro && exibidos > 0;

    return (
        <main className="sice-listagem">
            <CabecalhoListagem
                titulo="Gerenciar eventos"
                descricao="Acompanhe os eventos escolares, edite informações e gerencie cancelamentos."
                icone="bi-calendar-event"
                acao={(
                    <Link to="/cadastrarEventos" className="sice-botao sice-botao--primario sice-listagem__nova-acao">
                        <i className="bi bi-plus-lg" aria-hidden="true" />
                        Cadastrar evento
                    </Link>
                )}
            />

            {aviso && <Aviso variante="sucesso" role="status">{aviso}</Aviso>}
            {ultimoCanceladoId !== null && (
                <div className="sice-listagem__atalho-avisos">
                    <i className="bi bi-chat-dots" aria-hidden="true" />
                    <Link to={`/avisos?aba=cancelamentos&eventoId=${ultimoCanceladoId}`}>
                        Consultar comunicações deste cancelamento
                    </Link>
                </div>
            )}
            {erroAcao && <Aviso variante="erro" role="alert">{erroAcao}</Aviso>}

            <section className="sice-listagem__painel" aria-label="Listagem de eventos">
                <div className="sice-listagem__ferramentas">
                    <CampoPesquisa
                        valor={pesquisa}
                        aoAlterar={setPesquisa}
                        rotulo="Pesquisar eventos"
                        placeholder="Título, data, status, destino ou ID"
                        desabilitado={loading || !!erro}
                    />
                    <p className="sice-listagem__contador" aria-live="polite" aria-atomic="true">
                        {loading ? "Carregando eventos..." : erro ? "Não foi possível consultar os eventos." :
                            pesquisa.trim() ? `${exibidos} de ${total} evento(s)` : `${total} evento(s) cadastrado(s)`}
                    </p>
                </div>

                {erro ? (
                    <Aviso variante="erro" titulo="Não foi possível carregar os eventos" role="alert">
                        <p>{erro}</p>
                        <Botao type="button" variante="secundario" icone="bi-arrow-clockwise"
                            className="sice-listagem__tentar-novamente" onClick={() => void carregarEventos()}>
                            Tentar novamente
                        </Botao>
                    </Aviso>
                ) : loading ? (
                    <div className="sice-listagem__estado" role="status">
                        <i className="bi bi-hourglass-split" aria-hidden="true" />
                        Carregando eventos...
                    </div>
                ) : exibidos === 0 ? (
                    <div className="sice-listagem__estado" role="status">
                        <i className="bi bi-search" aria-hidden="true" />
                        <strong>{total === 0 ? "Nenhum evento cadastrado." : "Nenhum evento encontrado."}</strong>
                        {total > 0 && pesquisa.trim() && <p>Tente outro título, data, destinatário ou status.</p>}
                    </div>
                ) : null}

                {possuiResultados && (
                    <>
                        <div className="sice-listagem__tabela-rolagem" tabIndex={0}
                            role="region" aria-label="Tabela de eventos, com rolagem horizontal se necessário">
                            <table className="sice-listagem__tabela sice-listagem__tabela--eventos">
                                <caption className="sice-visualmente-oculto">Eventos escolares cadastrados</caption>
                                <thead>
                                    <tr>
                                        <th scope="col">ID</th>
                                        <th scope="col">Título</th>
                                        <th scope="col">Data</th>
                                        <th scope="col">Horário</th>
                                        <th scope="col">Status</th>
                                        <th scope="col">Destinatários</th>
                                        <th scope="col">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {eventosFiltrados.map((evento) => (
                                        <tr key={evento.id}>
                                            <td>{evento.id}</td>
                                            <td className="sice-listagem__nome">{evento.titulo}</td>
                                            <td>{apresentarData(evento.dataInicio)}</td>
                                            <td>{evento.horaInicio.slice(0, 5)}</td>
                                            <td><EtiquetaStatusEvento status={evento.status} /></td>
                                            <td>{rotuloDestinos(evento)}</td>
                                            <td><AcoesEvento evento={evento} processandoId={processandoId}
                                                dataHoje={dataHoje} aoCancelar={iniciarCancelamento} aoAlterarStatus={executarAcao} /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="sice-listagem__cartoes" aria-label="Eventos escolares cadastrados">
                            {eventosFiltrados.map((evento) => (
                                <article className="sice-listagem__cartao" key={evento.id}>
                                    <div className="sice-listagem__cartao-topo">
                                        <h2>{evento.titulo}</h2>
                                        <EtiquetaStatusEvento status={evento.status} />
                                    </div>
                                    <dl className="sice-listagem__dados">
                                        <div><dt>ID do evento</dt><dd>{evento.id}</dd></div>
                                        <div><dt>Data</dt><dd>{apresentarData(evento.dataInicio)}</dd></div>
                                        <div><dt>Horário</dt><dd>{evento.horaInicio.slice(0, 5)}</dd></div>
                                        <div><dt>Destinatários</dt><dd>{rotuloDestinos(evento)}</dd></div>
                                    </dl>
                                    <AcoesEvento evento={evento} processandoId={processandoId}
                                        dataHoje={dataHoje} aoCancelar={iniciarCancelamento} aoAlterarStatus={executarAcao} />
                                </article>
                            ))}
                        </div>
                    </>
                )}
            </section>

            {eventoParaCancelar && (
                <ConfirmarCancelamentoEvento
                    evento={eventoParaCancelar}
                    onFechar={() => setEventoParaCancelar(null)}
                    onConcluido={(atualizado, mensagem) => {
                        setEventos((atuais) => atuais.map((item) => item.id === atualizado.id ? atualizado : item));
                        setAviso(mensagem);
                        setUltimoCanceladoId(atualizado.id);
                        setEventoParaCancelar(null);
                    }}
                />
            )}
        </main>
    );
}
