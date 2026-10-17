import { useEffect, useState } from "react";
import { Link } from "react-router";
import { listarTodos as listarEventos } from "../../services/eventoService";
import { listarTodos as listarGrupos } from "../../services/grupoWhatsappService";
import type { Evento } from "../../types/evento";
import { formatarDataAviso, formatarDataHoraAviso } from "../../utils/datasAvisos";
import { mensagemErroApi } from "../../utils/erroApi";
import { listarComunicacoesCancelamento } from "../../services/comunicacaoCancelamentoService";
import type { ComunicacaoCancelamento } from "../../types/comunicacaoCancelamento";
import Botao from "../ui/Botao";
import Aviso from "../ui/Aviso";
import EtiquetaStatusAviso from "../ui/EtiquetaStatusAviso";

function HistoricoCancelamento({ comunicacao }: { comunicacao: ComunicacaoCancelamento }) {
  return (
    <details className="sice-avisos__historico-cancelamento">
      <summary><i className="bi bi-journal-text" aria-hidden="true" />Ver histórico e mensagem<i className="bi bi-chevron-down sice-avisos__historico-seta" aria-hidden="true" /></summary>
      <div className="sice-avisos__historico-conteudo">
        <p><strong>Aviso original:</strong> <Link to={`/avisos/envios/${comunicacao.envioOriginalId}`}>#{comunicacao.envioOriginalId}</Link></p>
        <p><strong>Último erro:</strong> {comunicacao.ultimoErro || "Nenhum erro registrado."}</p>
        <p><strong>Mensagem enviada ao bot:</strong></p>
        <p className="sice-avisos__mensagem-erro sice-avisos__mensagem-conteudo">{comunicacao.mensagem}</p>
        <strong>Tentativas</strong>
        {comunicacao.historico.length === 0 ? <p>Sem tentativas registradas.</p> : (
          <ol>{comunicacao.historico.map((t) => (
            <li key={t.numero}>
              <strong>Tentativa {t.numero}:</strong> {t.resultado === "CONFIRMADO_PELO_BOT" ? "Confirmado pelo bot" : "Sem confirmação"}.
              {" "}{formatarDataHoraAviso(t.inicio)} – {formatarDataHoraAviso(t.fim)}.
              {t.erro && <span> {t.erro}</span>}
            </li>
          ))}</ol>
        )}
      </div>
    </details>
  );
}

interface Props {
  eventoIdInicial?: number;
}

/** Painel de consulta: não envia avisos e não altera eventos. */
export default function ComunicacoesCancelamentoPainel({ eventoIdInicial }: Props) {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [nomesGrupos, setNomesGrupos] = useState<Record<number, string>>({});
  const [eventoId, setEventoId] = useState<number | null>(eventoIdInicial ?? null);
  const [comunicacoes, setComunicacoes] = useState<ComunicacaoCancelamento[]>([]);
  const [carregandoEventos, setCarregandoEventos] = useState(true);
  const [carregandoComunicacoes, setCarregandoComunicacoes] = useState(false);
  const [erroEventos, setErroEventos] = useState("");
  const [erroComunicacoes, setErroComunicacoes] = useState("");
  const [atualizacaoEventos, setAtualizacaoEventos] = useState(0);
  const [atualizacaoComunicacoes, setAtualizacaoComunicacoes] = useState(0);

  useEffect(() => {
    let ativo = true;
    async function carregar() {
      setCarregandoEventos(true);
      setErroEventos("");
      try {
        const todos = await listarEventos();
        if (ativo) setEventos(todos.filter((e) => e.status === "CANCELADO").sort((a, b) => b.id - a.id));
      } catch (falha) {
        if (ativo) setErroEventos(mensagemErroApi(falha, "Não foi possível listar os eventos cancelados."));
      } finally {
        if (ativo) setCarregandoEventos(false);
      }
      // A consulta de nomes é auxiliar; sua falha não impede ver os registros.
      try {
        const grupos = await listarGrupos();
        if (ativo) setNomesGrupos(Object.fromEntries(grupos.map((g) => [g.id, g.nome])));
      } catch {
        // IDs dos grupos continuam disponíveis.
      }
    }
    void carregar();
    return () => { ativo = false; };
  }, [atualizacaoEventos]);

  useEffect(() => {
    if (eventoId === null) return;
    const controller = new AbortController();
    const idConsulta = eventoId;
    async function carregar() {
      setCarregandoComunicacoes(true);
      setErroComunicacoes("");
      setComunicacoes([]);
      try {
        const resultado = await listarComunicacoesCancelamento(idConsulta, controller.signal);
        if (!controller.signal.aborted) setComunicacoes(resultado);
      } catch (falha) {
        if (!controller.signal.aborted) setErroComunicacoes(mensagemErroApi(falha, "Não foi possível consultar as comunicações de cancelamento."));
      } finally {
        if (!controller.signal.aborted) setCarregandoComunicacoes(false);
      }
    }
    void carregar();
    return () => controller.abort();
  }, [eventoId, atualizacaoComunicacoes]);

  const eventoSelecionado = eventos.find((evento) => evento.id === eventoId);

  return (
    <section aria-label="Comunicações de cancelamento" className="sice-avisos__secao sice-avisos__painel">
      <div className="sice-avisos__titulo-bloco"><i className="bi bi-calendar-x" aria-hidden="true" /><div><h2>Comunicações de cancelamento</h2><p>Consulte os grupos informados e as tentativas registradas.</p></div></div>
      <Aviso variante="informacao">Esta área serve apenas para consulta. <strong>Atualizar não reenvia mensagens</strong>. A confirmação do bot não garante a entrega no WhatsApp; resultados sem confirmação não devem ser reenviados automaticamente.</Aviso>
      {erroEventos && <Aviso variante="erro" titulo="Falha ao carregar eventos" role="alert">{erroEventos}<div className="sice-avisos__aviso-acao"><Botao type="button" variante="secundario" icone="bi-arrow-clockwise" onClick={() => setAtualizacaoEventos((n) => n + 1)}>Tentar novamente</Botao></div></Aviso>}
      {carregandoEventos && <p role="status" className="sice-avisos__carregando"><i className="bi bi-hourglass-split" aria-hidden="true" />Carregando eventos cancelados...</p>}
      {!carregandoEventos && !erroEventos && (
        <div className="sice-avisos__filtros">
          <label className="sice-avisos__campo sice-avisos__campo--busca">Evento cancelado
            <select value={eventoId ?? ""} onChange={(e) => setEventoId(e.target.value ? Number(e.target.value) : null)}>
              <option value="">Selecione um evento</option>
              {eventos.map((evento) => <option key={evento.id} value={evento.id}>{evento.titulo} — {formatarDataAviso(evento.dataInicio)} (#{evento.id})</option>)}
            </select>
          </label>
          <Botao type="button" variante="secundario" icone="bi-arrow-clockwise" onClick={() => setAtualizacaoEventos((n) => n + 1)}>Atualizar eventos</Botao>
        </div>
      )}
      {eventoSelecionado && <p><Link className="sice-avisos__link-acao" to={`/eventos/${eventoSelecionado.id}`}><i className="bi bi-box-arrow-up-right" aria-hidden="true" />Ver detalhes de {eventoSelecionado.titulo}</Link></p>}
      {eventoId === null && !carregandoEventos && !erroEventos && <div className="sice-avisos__vazio"><i className="bi bi-calendar2-week" aria-hidden="true" /><strong>Selecione um evento cancelado</strong><p>Escolha um evento acima para consultar suas comunicações.</p></div>}
      {eventoId !== null && carregandoComunicacoes && <p className="sice-avisos__carregando" role="status"><i className="bi bi-hourglass-split" aria-hidden="true" />Carregando comunicações...</p>}
      {eventoId !== null && !carregandoComunicacoes && erroComunicacoes && (
        <Aviso variante="erro" titulo="Falha ao carregar comunicações" role="alert">{erroComunicacoes}<div className="sice-avisos__aviso-acao"><Botao type="button" variante="secundario" icone="bi-arrow-clockwise" onClick={() => setAtualizacaoComunicacoes((n) => n + 1)}>Tentar novamente</Botao></div></Aviso>
      )}
      {eventoId !== null && !carregandoComunicacoes && !erroComunicacoes && (
        <>
          <div className="sice-avisos__barra">
            <p><strong>{comunicacoes.length}</strong> comunicado(s) registrado(s) para este evento</p>
            <Botao type="button" variante="secundario" icone="bi-arrow-clockwise" onClick={() => setAtualizacaoComunicacoes((n) => n + 1)}>Atualizar status</Botao>
          </div>
          {comunicacoes.length === 0 ? (
            <div className="sice-avisos__vazio"><i className="bi bi-inbox" aria-hidden="true" /><strong>Sem comunicados registrados</strong><p>O evento pode ter sido cancelado sem envio, sem grupos elegíveis ou após o horário previsto.</p></div>
          ) : (
            <>
              <div className="sice-avisos__rolagem sice-avisos__so-desktop">
                <table>
                  <thead><tr><th>Grupo</th><th>Status</th><th>Tentativas</th><th>Criado em</th><th>Processado em</th><th>Histórico</th></tr></thead>
                  <tbody>{comunicacoes.map((comunicacao) => (
                    <tr key={comunicacao.id}>
                      <td className="sice-avisos__nome">{nomesGrupos[comunicacao.grupoId] ?? `Grupo #${comunicacao.grupoId}`}</td>
                      <td><EtiquetaStatusAviso status={comunicacao.status} contexto="cancelamento" /></td>
                      <td>{comunicacao.tentativas}</td>
                      <td>{formatarDataHoraAviso(comunicacao.criadoEm)}</td>
                      <td>{formatarDataHoraAviso(comunicacao.enviadoEm)}</td>
                      <td><HistoricoCancelamento comunicacao={comunicacao} /></td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
              <div className="sice-avisos__cartoes sice-avisos__so-mobile">
                {comunicacoes.map((comunicacao) => (
                  <article key={comunicacao.id} className="sice-avisos__cartao">
                    <h3>{nomesGrupos[comunicacao.grupoId] ?? `Grupo #${comunicacao.grupoId}`}</h3>
                    <EtiquetaStatusAviso status={comunicacao.status} contexto="cancelamento" />
                    {comunicacao.status === "ERRO" && <p className="sice-avisos__observacao">Resultado sem confirmação: não reenviar automaticamente.</p>}
                    <dl>
                      <dt>Tentativas</dt><dd>{comunicacao.tentativas}</dd>
                      <dt>Criado em</dt><dd>{formatarDataHoraAviso(comunicacao.criadoEm)}</dd>
                      <dt>Processado em</dt><dd>{formatarDataHoraAviso(comunicacao.enviadoEm)}</dd>
                    </dl>
                    <HistoricoCancelamento comunicacao={comunicacao} />
                  </article>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </section>
  );
}
