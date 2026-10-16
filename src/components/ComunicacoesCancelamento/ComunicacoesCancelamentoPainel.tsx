import { useEffect, useState } from "react";
import { Link } from "react-router";
import { listarTodos as listarEventos } from "../../services/eventoService";
import { listarTodos as listarGrupos } from "../../services/grupoWhatsappService";
import type { Evento } from "../../types/evento";
import { formatarDataAviso, formatarDataHoraAviso } from "../../utils/datasAvisos";
import { mensagemErroApi } from "../../utils/erroApi";
import { listarComunicacoesCancelamento } from "../../services/comunicacaoCancelamentoService";
import type { StatusComunicacaoCancelamento, ComunicacaoCancelamento } from "../../types/comunicacaoCancelamento";

const STATUS: Record<StatusComunicacaoCancelamento, string> = {
  PENDENTE: "Aguardando processamento",
  ENVIADO: "Confirmado pelo bot",
  ERRO: "Sem confirmação — não reenviar automaticamente",
  CANCELADO: "Não processado",
};

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
    <section aria-label="Comunicações de cancelamento" className="sice-avisos__secao">
      <p className="sice-avisos__nota">Aqui estão os comunicados de cancelamento de um evento. Esta é uma consulta; atualizar não reenvia mensagens. A confirmação do bot não garante a entrega no WhatsApp.</p>
      {erroEventos && <div className="sice-avisos__erro" role="alert"><p>{erroEventos}</p><button type="button" onClick={() => setAtualizacaoEventos((n) => n + 1)}>Tentar novamente</button></div>}
      {carregandoEventos && <p role="status">Carregando eventos cancelados...</p>}
      {!carregandoEventos && !erroEventos && (
        <div className="sice-avisos__filtros">
          <label>Evento cancelado
            <select value={eventoId ?? ""} onChange={(e) => setEventoId(e.target.value ? Number(e.target.value) : null)}>
              <option value="">Selecione um evento</option>
              {eventos.map((evento) => <option key={evento.id} value={evento.id}>{evento.titulo} — {formatarDataAviso(evento.dataInicio)} (#{evento.id})</option>)}
            </select>
          </label>
          <button type="button" onClick={() => setAtualizacaoEventos((n) => n + 1)}>Atualizar eventos</button>
        </div>
      )}
      {eventoSelecionado && <p><Link to={`/eventos/${eventoSelecionado.id}`}>Ver detalhes de {eventoSelecionado.titulo}</Link></p>}
      {eventoId === null && !carregandoEventos && !erroEventos && <p>Selecione um evento cancelado para consultar suas comunicações.</p>}
      {eventoId !== null && carregandoComunicacoes && <p role="status">Carregando comunicações...</p>}
      {eventoId !== null && !carregandoComunicacoes && erroComunicacoes && (
        <div className="sice-avisos__erro" role="alert"><p>{erroComunicacoes}</p><button type="button" onClick={() => setAtualizacaoComunicacoes((n) => n + 1)}>Tentar novamente</button></div>
      )}
      {eventoId !== null && !carregandoComunicacoes && !erroComunicacoes && (
        <>
          <div className="sice-avisos__barra">
            <p>{comunicacoes.length} comunicado(s) registrado(s) para este evento</p>
            <button type="button" onClick={() => setAtualizacaoComunicacoes((n) => n + 1)}>Atualizar status</button>
          </div>
          {comunicacoes.length === 0 ? (
            <p>Nenhum comunicado registrado. O evento pode ter sido cancelado sem envio, sem grupos elegíveis ou após o horário previsto.</p>
          ) : (
            <div className="sice-avisos__rolagem">
              <table>
                <thead><tr><th>Grupo</th><th>Status</th><th>Tentativas</th><th>Criado em</th><th>Processado em</th><th>Histórico</th></tr></thead>
                <tbody>{comunicacoes.map((comunicacao) => (
                  <tr key={comunicacao.id}>
                    <td>{nomesGrupos[comunicacao.grupoId] ?? `Grupo #${comunicacao.grupoId}`}</td>
                    <td>{STATUS[comunicacao.status]}</td>
                    <td>{comunicacao.tentativas}</td>
                    <td>{formatarDataHoraAviso(comunicacao.criadoEm)}</td>
                    <td>{formatarDataHoraAviso(comunicacao.enviadoEm)}</td>
                    <td>
                      <details className="sice-avisos__historico-cancelamento">
                        <summary>Ver detalhes</summary>
                        <p><strong>Aviso original:</strong> <Link to={`/avisos/envios/${comunicacao.envioOriginalId}`}>#{comunicacao.envioOriginalId}</Link></p>
                        <p><strong>Último erro:</strong> {comunicacao.ultimoErro || "Nenhum erro registrado."}</p>
                        <p><strong>Mensagem:</strong></p>
                        <p className="sice-avisos__mensagem-erro">{comunicacao.mensagem}</p>
                        <strong>Tentativas</strong>
                        {comunicacao.historico.length === 0 ? <p>Sem tentativas registradas.</p> : (
                          <ol>{comunicacao.historico.map((t) => (
                            <li key={t.numero}>
                              Tentativa {t.numero}: {t.resultado === "CONFIRMADO_PELO_BOT" ? "Confirmado pelo bot" : "Sem confirmação"}.
                              {" "}{formatarDataHoraAviso(t.inicio)} – {formatarDataHoraAviso(t.fim)}.
                              {t.erro && <span> {t.erro}</span>}
                            </li>
                          ))}</ol>
                        )}
                      </details>
                    </td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
        </>
      )}
    </section>
  );
}
