import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useSearchParams } from "react-router";

import { listarEnvios } from "../../../../services/envioAvisoService";
import { listarTodos } from "../../../../services/eventoService";
import type { Evento } from "../../../../types/evento";
import type { PaginaEnvios, StatusEnvioAviso } from "../../../../types/envioAviso";
import { formatarDataAviso, hojeNaEscola } from "../../../../utils/datasAvisos";
import { mensagemErroApi } from "../../../../utils/erroApi";
import "./avisos.css";
import ComunicacoesCancelamentoPainel from "../../../../components/ComunicacoesCancelamento/ComunicacoesCancelamentoPainel";

type Aba = "envios" | "programados" | "cancelamentos";

const STATUS: Record<StatusEnvioAviso, string> = {
  PENDENTE: "Pendente", ENVIADO: "Processado pelo bot", ERRO: "Erro", CANCELADO: "Interrompido",
};

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
      <h1>Gerenciar avisos</h1>
      <p>Consulte os registros de comunicação com os grupos de WhatsApp. Esta tela não envia mensagens.</p>

      <div className="sice-avisos__abas" role="group" aria-label="Visualização dos avisos">
        <button type="button" aria-pressed={aba === "envios"} onClick={() => mudarAba("envios")}>Envios registrados</button>
        <button type="button" aria-pressed={aba === "programados"} onClick={() => mudarAba("programados")}>Programados</button>
        <button type="button" aria-pressed={aba === "cancelamentos"} onClick={() => mudarAba("cancelamentos")}>Cancelamentos</button>
      </div>

      {aba === "envios" ? (
        <section aria-label="Envios registrados" className="sice-avisos__secao">
          <form className="sice-avisos__filtros" onSubmit={aplicarFiltros}>
            <label>Buscar evento ou grupo
              <input type="search" value={buscaDigitada} maxLength={100} onChange={(e) => setBuscaDigitada(e.target.value)} placeholder="Nome do evento ou grupo" />
            </label>
            <label>Status
              <select value={statusSelecionado} onChange={(e) => setStatusSelecionado(e.target.value)}>
                <option value="">Todos</option>
                <option value="PENDENTE">Pendente</option>
                <option value="ENVIADO">Processado pelo bot</option>
                <option value="ERRO">Erro</option>
                <option value="CANCELADO">Interrompido</option>
              </select>
            </label>
            <button type="submit">Filtrar</button>
            <button type="button" onClick={() => {
              setBuscaDigitada(""); setStatusSelecionado(""); setFiltro({ status: "", busca: "" }); setPagina(0);
            }}>Limpar</button>
          </form>
          <p className="sice-avisos__nota">Um registro corresponde à operação de aviso para um grupo, que pode conter várias tentativas. “Processado pelo bot” não comprova entrega no WhatsApp.</p>
          {erro && <div role="alert" className="sice-avisos__erro"><p>{erro}</p><button type="button" onClick={() => setAtualizacao((n) => n + 1)}>Tentar novamente</button></div>}
          {carregando && <p role="status">Carregando envios...</p>}
          {!carregando && !erro && registros && (
            <>
              <div className="sice-avisos__barra"><p>{registros.total} registro(s) encontrado(s)</p><button type="button" onClick={() => setAtualizacao((n) => n + 1)}>Atualizar</button></div>
              <div className="sice-avisos__rolagem">
                <table>
                  <thead><tr><th>Evento</th><th>Grupo</th><th>Data prevista</th><th>Status</th><th>Tentativas</th><th>Ação</th></tr></thead>
                  <tbody>
                    {registros.itens.length === 0 ? (
                      <tr><td colSpan={6}>Nenhum envio encontrado para os filtros selecionados.</td></tr>
                    ) : registros.itens.map((envio) => (
                      <tr key={envio.id}>
                        <td>{envio.eventoTitulo}</td>
                        <td>{envio.grupoNome}</td>
                        <td>{formatarDataAviso(envio.dataAviso)}</td>
                        <td>{STATUS[envio.status]}</td>
                        <td>{envio.tentativas}</td>
                        <td><Link to={`/avisos/envios/${envio.id}`}>Ver detalhes</Link></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {registros.totalPaginas > 1 && (
                <nav className="sice-avisos__paginacao" aria-label="Páginas de envios">
                  <button type="button" disabled={pagina === 0} onClick={() => setPagina((n) => Math.max(0, n - 1))}>Anterior</button>
                  <span>Página {registros.pagina + 1} de {registros.totalPaginas}</span>
                  <button type="button" disabled={pagina + 1 >= registros.totalPaginas} onClick={() => setPagina((n) => n + 1)}>Próxima</button>
                </nav>
              )}
            </>
          )}
        </section>
      ) : aba === "programados" ? (
        <section className="sice-avisos__secao" aria-label="Avisos programados">
          <p className="sice-avisos__nota">Eventos ativos com data de aviso futura. São previsões de agendamento, não confirmações de envio ou de criação de registros por grupo. Envios de hoje e anteriores só aparecem na aba de registros depois que um processamento criar seus registros individuais.</p>
          {erro && <div role="alert" className="sice-avisos__erro"><p>{erro}</p><button type="button" onClick={() => setAtualizacao((n) => n + 1)}>Tentar novamente</button></div>}
          {carregando && <p role="status">Carregando programação...</p>}
          {!carregando && !erro && (
            <>
              <div className="sice-avisos__barra"><p>{programados.length} evento(s) com avisos futuros</p><button type="button" onClick={() => setAtualizacao((n) => n + 1)}>Atualizar</button></div>
              <div className="sice-avisos__rolagem">
                <table>
                  <thead><tr><th>Evento</th><th>Data do aviso</th><th>Data do evento</th><th>Ação</th></tr></thead>
                  <tbody>{programados.length === 0 ? (
                    <tr><td colSpan={4}>Nenhum aviso futuro programado.</td></tr>
                  ) : programados.map((evento) => (
                    <tr key={evento.id}>
                      <td>{evento.titulo}</td>
                      <td>{formatarDataAviso(evento.dataAviso)}</td>
                      <td>{formatarDataAviso(evento.dataInicio)} às {evento.horaInicio.slice(0, 5)}</td>
                      <td><Link to={`/eventos/${evento.id}`}>Ver evento</Link></td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </>
          )}
        </section>
      ) : (
        <ComunicacoesCancelamentoPainel key={eventoIdInicial ?? "selecionar"} eventoIdInicial={eventoIdInicial} />
      )}
    </main>
  );
}
