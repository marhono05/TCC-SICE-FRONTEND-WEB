import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router";

import { formatarDataHoraAviso } from "../../utils/datasAvisos";
import { mensagemErroApi } from "../../utils/erroApi";
import Botao from "../ui/Botao";
import Aviso from "../ui/Aviso";
import EtiquetaStatusAviso from "./EtiquetaStatusAviso";
import { listarTodasComunicacoesCancelamento } from "../../services/comunicacaoCancelamentoService";
import type { PaginaComunicacoesCancelamento, StatusComunicacaoCancelamento } from "../../types/comunicacaoCancelamento";

interface Props {
  /** Mantém o atalho que abre a Central a partir de um evento cancelado. */
  eventoIdInicial?: number;
  onLimparEvento?: () => void;
}

/** Lista apenas o resumo de cada comunicação; o histórico fica na página de detalhes. */
export default function ComunicacoesCancelamentoPainel({ eventoIdInicial, onLimparEvento }: Props) {
  const [buscaDigitada, setBuscaDigitada] = useState("");
  const [statusSelecionado, setStatusSelecionado] = useState("");
  const [filtro, setFiltro] = useState({ busca: "", status: "" });
  const [pagina, setPagina] = useState(0);
  const [registros, setRegistros] = useState<PaginaComunicacoesCancelamento | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [atualizacao, setAtualizacao] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function carregar() {
      setCarregando(true);
      setErro("");
      setRegistros(null);
      try {
        const resultado = await listarTodasComunicacoesCancelamento({
          pagina,
          tamanho: 15,
          eventoId: eventoIdInicial,
          status: filtro.status ? filtro.status as StatusComunicacaoCancelamento : undefined,
          busca: filtro.busca || undefined,
        }, controller.signal);
        if (!controller.signal.aborted) setRegistros(resultado);
      } catch (falha) {
        if (!controller.signal.aborted) setErro(mensagemErroApi(falha, "Não foi possível consultar as comunicações de cancelamento."));
      } finally {
        if (!controller.signal.aborted) setCarregando(false);
      }
    }

    void carregar();
    return () => controller.abort();
  }, [eventoIdInicial, filtro, pagina, atualizacao]);

  function aplicarFiltros(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setPagina(0);
    setFiltro({ busca: buscaDigitada.trim(), status: statusSelecionado });
  }

  function limparFiltros() {
    setBuscaDigitada("");
    setStatusSelecionado("");
    setFiltro({ busca: "", status: "" });
    setPagina(0);
  }

  return (
    <section aria-label="Comunicações de cancelamento" className="sice-avisos__secao sice-avisos__painel">
      <div className="sice-avisos__titulo-bloco"><i className="bi bi-calendar-x" aria-hidden="true" /><div><h2>Comunicações de cancelamento</h2><p>Consulte os cancelamentos registrados e abra os detalhes para visualizar suas tentativas.</p></div></div>

      {eventoIdInicial !== undefined && (
        <div className="sice-avisos__barra">
          <p>Exibindo apenas as comunicações do <Link to={`/eventos/${eventoIdInicial}`}>evento #{eventoIdInicial}</Link>.</p>
          <Botao type="button" variante="secundario" icone="bi-list-ul" onClick={onLimparEvento}>Ver todos os cancelamentos</Botao>
        </div>
      )}

      <form className="sice-avisos__filtros" onSubmit={aplicarFiltros}>
        <label className="sice-avisos__campo sice-avisos__campo--busca">Buscar evento ou grupo
          <input type="search" value={buscaDigitada} maxLength={100} onChange={(e) => setBuscaDigitada(e.target.value)} placeholder="Nome do evento ou grupo" />
        </label>
        <label className="sice-avisos__campo">Status
          <select value={statusSelecionado} onChange={(e) => setStatusSelecionado(e.target.value)}>
            <option value="">Todos</option>
            <option value="PENDENTE">Aguardando processamento</option>
            <option value="ENVIADO">Confirmado pelo bot</option>
            <option value="ERRO">Sem confirmação</option>
            <option value="CANCELADO">Não processado</option>
          </select>
        </label>
        <div className="sice-avisos__filtros-acoes">
          <Botao type="submit" icone="bi-funnel">Filtrar</Botao>
          <Botao type="button" variante="secundario" icone="bi-x-circle" onClick={limparFiltros}>Limpar</Botao>
        </div>
      </form>

      <Aviso variante="informacao">Cada registro representa uma comunicação para um grupo e pode conter várias tentativas. <strong>“Confirmado pelo bot” não garante entrega no WhatsApp.</strong></Aviso>

      {erro && <Aviso variante="erro" titulo="Falha ao carregar comunicações" role="alert">{erro}<div className="sice-avisos__aviso-acao"><Botao type="button" variante="secundario" icone="bi-arrow-clockwise" onClick={() => setAtualizacao((n) => n + 1)}>Tentar novamente</Botao></div></Aviso>}
      {carregando && <p className="sice-avisos__carregando" role="status"><i className="bi bi-hourglass-split" aria-hidden="true" />Carregando comunicações...</p>}

      {!carregando && !erro && registros && (
        <>
          <div className="sice-avisos__barra">
            <p><strong>{registros.total}</strong> comunicação(ões) encontrada(s)</p>
            <Botao type="button" variante="secundario" icone="bi-arrow-clockwise" onClick={() => setAtualizacao((n) => n + 1)}>Atualizar</Botao>
          </div>
          {registros.itens.length === 0 ? (
            <div className="sice-avisos__vazio"><i className="bi bi-inbox" aria-hidden="true" /><strong>Nenhuma comunicação encontrada</strong><p>Não há comunicações para os filtros selecionados. Eventos cancelados sem avisos enviados podem não gerar comunicações.</p></div>
          ) : (
            <>
              <div className="sice-avisos__rolagem sice-avisos__so-desktop">
                <table>
                  <thead><tr><th>Evento</th><th>Grupo</th><th>Criado em</th><th>Status</th><th>Tentativas</th><th>Ação</th></tr></thead>
                  <tbody>{registros.itens.map((comunicacao) => (
                    <tr key={comunicacao.id}>
                      <td className="sice-avisos__nome">{comunicacao.eventoTitulo}</td>
                      <td>{comunicacao.grupoNome}</td>
                      <td>{formatarDataHoraAviso(comunicacao.criadoEm)}</td>
                      <td><EtiquetaStatusAviso status={comunicacao.status} contexto="cancelamento" /></td>
                      <td>{comunicacao.tentativas}</td>
                      <td><Link className="sice-avisos__link-acao" to={`/avisos/cancelamentos/${comunicacao.id}`}><i className="bi bi-eye" aria-hidden="true" />Ver detalhes</Link></td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
              <div className="sice-avisos__cartoes sice-avisos__so-mobile">
                {registros.itens.map((comunicacao) => (
                  <article key={comunicacao.id} className="sice-avisos__cartao">
                    <h3>{comunicacao.eventoTitulo}</h3>
                    <EtiquetaStatusAviso status={comunicacao.status} contexto="cancelamento" />
                    <dl>
                      <dt>Grupo</dt><dd>{comunicacao.grupoNome}</dd>
                      <dt>Criado em</dt><dd>{formatarDataHoraAviso(comunicacao.criadoEm)}</dd>
                      <dt>Tentativas</dt><dd>{comunicacao.tentativas}</dd>
                    </dl>
                    <Link className="sice-avisos__link-acao" to={`/avisos/cancelamentos/${comunicacao.id}`}><i className="bi bi-eye" aria-hidden="true" />Ver detalhes</Link>
                  </article>
                ))}
              </div>
            </>
          )}
          {registros.totalPaginas > 1 && (
            <nav className="sice-avisos__paginacao" aria-label="Páginas de comunicações de cancelamento">
              <Botao type="button" variante="secundario" icone="bi-chevron-left" disabled={pagina === 0} onClick={() => setPagina((n) => Math.max(0, n - 1))}>Anterior</Botao>
              <span>Página {registros.pagina + 1} de {registros.totalPaginas}</span>
              <Botao type="button" variante="secundario" icone="bi-chevron-right" disabled={pagina + 1 >= registros.totalPaginas} onClick={() => setPagina((n) => n + 1)}>Próxima</Botao>
            </nav>
          )}
        </>
      )}
    </section>
  );
}
