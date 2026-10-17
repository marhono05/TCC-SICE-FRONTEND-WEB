import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useSearchParams } from "react-router";

import { listarEnvios } from "../../../../services/envioAvisoService";
import { listarTodos } from "../../../../services/eventoService";
import type { Evento } from "../../../../types/evento";
import type { PaginaEnvios, StatusEnvioAviso } from "../../../../types/envioAviso";
import { formatarDataAviso, hojeNaEscola } from "../../../../utils/datasAvisos";
import { mensagemErroApi } from "../../../../utils/erroApi";
import CabecalhoListagem from "../../../../components/ui/CabecalhoListagem";
import Botao from "../../../../components/ui/Botao";
import Aviso from "../../../../components/ui/Aviso";
import EtiquetaStatusAviso from "../../../../components/avisos/EtiquetaStatusAviso";
import ComunicacoesCancelamentoPainel from "../../../../components/avisos/ComunicacoesCancelamentoPainel";
import "./avisos.css";

type Aba = "envios" | "programados" | "cancelamentos";

export default function ListarAvisosPage() {
  const [parametros, setParametros] = useSearchParams();
  const aba: Aba = parametros.get("aba") === "cancelamentos"
    ? "cancelamentos" : parametros.get("aba") === "programados" ? "programados" : "envios";
  const eventoIdParametro = Number(parametros.get("eventoId"));
  const eventoIdInicial = Number.isSafeInteger(eventoIdParametro) && eventoIdParametro > 0
    ? eventoIdParametro : undefined;
  function mudarAba(novaAba: Aba) { setParametros({ aba: novaAba }); }
  const [statusSelecionado, setStatusSelecionado] = useState("");
  const [buscaDigitada, setBuscaDigitada] = useState("");
  const [filtro, setFiltro] = useState({ status: "", busca: "" });
  const [pagina, setPagina] = useState(0);
  const [atualizacao, setAtualizacao] = useState(0);
  const [registros, setRegistros] = useState<PaginaEnvios | null>(null);
  const [programados, setProgramados] = useState<Evento[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (aba === "cancelamentos") return;
    const controller = new AbortController();
    async function carregar() {
      setCarregando(true);
      setErro("");
      setRegistros(null);
      setProgramados([]);
      try {
        if (aba === "envios") {
          const resposta = await listarEnvios({
            pagina, tamanho: 15,
            status: filtro.status ? filtro.status as StatusEnvioAviso : undefined,
            busca: filtro.busca || undefined,
          }, controller.signal);
          if (!controller.signal.aborted) setRegistros(resposta);
        } else {
          // Avisos futuros ainda podem não ter registro individual no banco.
          const eventos = await listarTodos();
          if (!controller.signal.aborted) {
            const hoje = hojeNaEscola();
            setProgramados(eventos.filter((e) => e.status === "ATIVO" && e.dataAviso > hoje)
              .sort((a, b) => a.dataAviso.localeCompare(b.dataAviso) || a.dataInicio.localeCompare(b.dataInicio)));
          }
        }
      } catch (falha) {
        if (!controller.signal.aborted) setErro(mensagemErroApi(falha, "Não foi possível carregar os avisos."));
      } finally {
        if (!controller.signal.aborted) setCarregando(false);
      }
    }
    void carregar();
    return () => controller.abort();
  }, [aba, filtro, pagina, atualizacao]);

  function aplicarFiltros(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setPagina(0);
    setFiltro({ status: statusSelecionado, busca: buscaDigitada.trim() });
  }

  return (
    <main className="sice-avisos">
      <CabecalhoListagem
        titulo="Central de Avisos"
        descricao="Consulte as comunicações com os grupos de WhatsApp e acompanhe as tentativas. Esta tela não envia mensagens."
        icone="bi-megaphone"
      />

      <nav className="sice-avisos__abas" aria-label="Visualização dos avisos">
        <button className="sice-avisos__aba" type="button" aria-current={aba === "envios" ? "page" : undefined} aria-pressed={aba === "envios"} onClick={() => mudarAba("envios")}> <i className="bi bi-send-check" aria-hidden="true" />Envios registrados</button>
        <button className="sice-avisos__aba" type="button" aria-current={aba === "programados" ? "page" : undefined} aria-pressed={aba === "programados"} onClick={() => mudarAba("programados")}> <i className="bi bi-calendar-event" aria-hidden="true" />Programados</button>
        <button className="sice-avisos__aba" type="button" aria-current={aba === "cancelamentos" ? "page" : undefined} aria-pressed={aba === "cancelamentos"} onClick={() => mudarAba("cancelamentos")}> <i className="bi bi-calendar-x" aria-hidden="true" />Cancelamentos</button>
      </nav>

      {aba === "envios" ? (
        <section aria-label="Envios registrados" className="sice-avisos__secao sice-avisos__painel">
          <div className="sice-avisos__titulo-bloco"><i className="bi bi-send-check" aria-hidden="true" /><div><h2>Envios registrados</h2><p>Pesquise e consulte as operações e suas tentativas.</p></div></div>
          <form className="sice-avisos__filtros" onSubmit={aplicarFiltros}>
            <label className="sice-avisos__campo sice-avisos__campo--busca">Buscar evento ou grupo
              <input type="search" value={buscaDigitada} maxLength={100} onChange={(e) => setBuscaDigitada(e.target.value)} placeholder="Nome do evento ou grupo" />
            </label>
            <label className="sice-avisos__campo">Status
              <select value={statusSelecionado} onChange={(e) => setStatusSelecionado(e.target.value)}>
                <option value="">Todos</option>
                <option value="PENDENTE">Pendente</option>
                <option value="ENVIADO">Processado pelo bot</option>
                <option value="ERRO">Erro</option>
                <option value="CANCELADO">Interrompido</option>
              </select>
            </label>
            <div className="sice-avisos__filtros-acoes">
              <Botao type="submit" icone="bi-funnel">Filtrar</Botao>
              <Botao type="button" variante="secundario" icone="bi-x-circle" onClick={() => {
                setBuscaDigitada(""); setStatusSelecionado(""); setFiltro({ status: "", busca: "" }); setPagina(0);
              }}>Limpar</Botao>
            </div>
          </form>
          <Aviso variante="informacao">Cada registro é uma operação para um grupo e pode conter várias tentativas. <strong>“Processado pelo bot” não comprova entrega no WhatsApp.</strong></Aviso>
          {erro && <Aviso variante="erro" titulo="Falha ao carregar envios" role="alert">{erro}<div className="sice-avisos__aviso-acao"><Botao type="button" variante="secundario" icone="bi-arrow-clockwise" onClick={() => setAtualizacao((n) => n + 1)}>Tentar novamente</Botao></div></Aviso>}
          {carregando && <p className="sice-avisos__carregando" role="status"><i className="bi bi-hourglass-split" aria-hidden="true" />Carregando envios...</p>}
          {!carregando && !erro && registros && (
            <>
              <div className="sice-avisos__barra"><p><strong>{registros.total}</strong> registro(s) encontrado(s)</p><Botao type="button" variante="secundario" icone="bi-arrow-clockwise" onClick={() => setAtualizacao((n) => n + 1)}>Atualizar</Botao></div>
              {registros.itens.length === 0 ? (
                <div className="sice-avisos__vazio"><i className="bi bi-inbox" aria-hidden="true" /><strong>Nenhum envio encontrado</strong><p>Tente outros filtros ou consulte outro período.</p></div>
              ) : (
                <>
                  <div className="sice-avisos__rolagem sice-avisos__so-desktop">
                    <table>
                      <thead><tr><th>Evento</th><th>Grupo</th><th>Data prevista</th><th>Status</th><th>Tentativas</th><th>Ação</th></tr></thead>
                      <tbody>{registros.itens.map((envio) => (
                        <tr key={envio.id}>
                          <td className="sice-avisos__nome">{envio.eventoTitulo}</td>
                          <td>{envio.grupoNome}</td>
                          <td>{formatarDataAviso(envio.dataAviso)}</td>
                          <td><EtiquetaStatusAviso status={envio.status} /></td>
                          <td>{envio.tentativas}</td>
                          <td><Link className="sice-avisos__link-acao" to={`/avisos/envios/${envio.id}`}><i className="bi bi-eye" aria-hidden="true" />Ver detalhes</Link></td>
                        </tr>
                      ))}</tbody>
                    </table>
                  </div>
                  <div className="sice-avisos__cartoes sice-avisos__so-mobile">
                    {registros.itens.map((envio) => (
                      <article key={envio.id} className="sice-avisos__cartao">
                        <h3>{envio.eventoTitulo}</h3>
                        <EtiquetaStatusAviso status={envio.status} />
                        <dl>
                          <dt>Grupo</dt><dd>{envio.grupoNome}</dd>
                          <dt>Data prevista</dt><dd>{formatarDataAviso(envio.dataAviso)}</dd>
                          <dt>Tentativas</dt><dd>{envio.tentativas}</dd>
                        </dl>
                        <Link className="sice-avisos__link-acao" to={`/avisos/envios/${envio.id}`}><i className="bi bi-eye" aria-hidden="true" />Ver detalhes</Link>
                      </article>
                    ))}
                  </div>
                </>
              )}
              {registros.totalPaginas > 1 && (
                <nav className="sice-avisos__paginacao" aria-label="Páginas de envios">
                  <Botao type="button" variante="secundario" icone="bi-chevron-left" disabled={pagina === 0} onClick={() => setPagina((n) => Math.max(0, n - 1))}>Anterior</Botao>
                  <span>Página {registros.pagina + 1} de {registros.totalPaginas}</span>
                  <Botao type="button" variante="secundario" icone="bi-chevron-right" disabled={pagina + 1 >= registros.totalPaginas} onClick={() => setPagina((n) => n + 1)}>Próxima</Botao>
                </nav>
              )}
            </>
          )}
        </section>
      ) : aba === "programados" ? (
        <section className="sice-avisos__secao sice-avisos__painel" aria-label="Avisos programados">
          <div className="sice-avisos__titulo-bloco"><i className="bi bi-calendar-event" aria-hidden="true" /><div><h2>Programação de avisos</h2><p>Eventos que ainda têm uma data de aviso futura.</p></div></div>
          <Aviso variante="informacao">Estes são eventos ativos com data de aviso futura. São <strong>previsões de agendamento</strong>, não confirmações de envio ou de criação de registros por grupo. Envios de hoje e anteriores aparecem nos registros somente quando o processamento cria seus registros individuais.</Aviso>
          {erro && <Aviso variante="erro" titulo="Falha ao carregar programação" role="alert">{erro}<div className="sice-avisos__aviso-acao"><Botao type="button" variante="secundario" icone="bi-arrow-clockwise" onClick={() => setAtualizacao((n) => n + 1)}>Tentar novamente</Botao></div></Aviso>}
          {carregando && <p className="sice-avisos__carregando" role="status"><i className="bi bi-hourglass-split" aria-hidden="true" />Carregando programação...</p>}
          {!carregando && !erro && (
            <>
              <div className="sice-avisos__barra"><p><strong>{programados.length}</strong> evento(s) com avisos futuros</p><Botao type="button" variante="secundario" icone="bi-arrow-clockwise" onClick={() => setAtualizacao((n) => n + 1)}>Atualizar</Botao></div>
              {programados.length === 0 ? (
                <div className="sice-avisos__vazio"><i className="bi bi-calendar2-check" aria-hidden="true" /><strong>Nenhum aviso futuro programado</strong><p>Não há eventos com data de aviso futura no momento.</p></div>
              ) : (
                <>
                  <div className="sice-avisos__rolagem sice-avisos__so-desktop"><table>
                    <thead><tr><th>Evento</th><th>Data do aviso</th><th>Data do evento</th><th>Ação</th></tr></thead>
                    <tbody>{programados.map((evento) => (
                      <tr key={evento.id}>
                        <td className="sice-avisos__nome">{evento.titulo}</td>
                        <td>{formatarDataAviso(evento.dataAviso)}</td>
                        <td>{formatarDataAviso(evento.dataInicio)} às {evento.horaInicio.slice(0, 5)}</td>
                        <td><Link className="sice-avisos__link-acao" to={`/eventos/${evento.id}`}><i className="bi bi-eye" aria-hidden="true" />Ver evento</Link></td>
                      </tr>
                    ))}</tbody>
                  </table></div>
                  <div className="sice-avisos__cartoes sice-avisos__so-mobile">
                    {programados.map((evento) => (
                      <article key={evento.id} className="sice-avisos__cartao">
                        <h3>{evento.titulo}</h3>
                        <dl><dt>Data do aviso</dt><dd>{formatarDataAviso(evento.dataAviso)}</dd><dt>Data do evento</dt><dd>{formatarDataAviso(evento.dataInicio)} às {evento.horaInicio.slice(0, 5)}</dd></dl>
                        <Link className="sice-avisos__link-acao" to={`/eventos/${evento.id}`}><i className="bi bi-eye" aria-hidden="true" />Ver evento</Link>
                      </article>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </section>
      ) : (
        <ComunicacoesCancelamentoPainel key={eventoIdInicial ?? "selecionar"} eventoIdInicial={eventoIdInicial} />
      )}
    </main>
  );
}
