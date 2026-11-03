import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";

import { buscarComunicacaoCancelamentoPorId } from "../../../../services/comunicacaoCancelamentoService";
import type { ComunicacaoCancelamento } from "../../../../types/comunicacaoCancelamento";
import { formatarDataHoraAviso } from "../../../../utils/datasAvisos";
import { mensagemErroApi } from "../../../../utils/erroApi";
import CabecalhoListagem from "../../../../components/ui/CabecalhoListagem";
import Botao from "../../../../components/ui/Botao";
import Aviso from "../../../../components/ui/Aviso";
import EtiquetaStatusAviso from "../../../../components/avisos/EtiquetaStatusAviso";
import DiagnosticoErroAviso from "../../../../components/avisos/DiagnosticoErroAviso";
import "../ListarAvisos/avisos.css";

export default function DetalhesCancelamentoPage() {
  const { id } = useParams();
  const comunicacaoId = Number(id);
  const idValido = Number.isSafeInteger(comunicacaoId) && comunicacaoId > 0;
  const [comunicacao, setComunicacao] = useState<ComunicacaoCancelamento | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [atualizacao, setAtualizacao] = useState(0);

  useEffect(() => {
    if (!idValido) return;
    const controller = new AbortController();

    async function carregar() {
      setCarregando(true);
      setErro("");
      setComunicacao(null);
      try {
        const dados = await buscarComunicacaoCancelamentoPorId(comunicacaoId, controller.signal);
        if (!controller.signal.aborted) setComunicacao(dados);
      } catch (falha) {
        if (!controller.signal.aborted) setErro(mensagemErroApi(falha, "Não foi possível consultar os detalhes do cancelamento."));
      } finally {
        if (!controller.signal.aborted) setCarregando(false);
      }
    }

    void carregar();
    return () => controller.abort();
  }, [comunicacaoId, idValido, atualizacao]);

  return (
    <main className="sice-avisos">
      <CabecalhoListagem titulo="Detalhes do cancelamento" descricao="Consulte a comunicação de cancelamento e suas tentativas registradas." icone="bi-journal-text" />
      <Link className="sice-avisos__voltar" to="/avisos?aba=cancelamentos"><i className="bi bi-arrow-left" aria-hidden="true" />Voltar para os cancelamentos</Link>

      {!idValido && <Aviso variante="erro" role="alert">Identificador de comunicação inválido.</Aviso>}
      {idValido && carregando && <p className="sice-avisos__carregando" role="status"><i className="bi bi-hourglass-split" aria-hidden="true" />Carregando detalhes...</p>}
      {idValido && !carregando && erro && (
        <Aviso variante="erro" titulo="Falha ao carregar detalhes" role="alert">{erro}<div className="sice-avisos__aviso-acao"><Botao type="button" variante="secundario" icone="bi-arrow-clockwise" onClick={() => setAtualizacao((n) => n + 1)}>Tentar novamente</Botao></div></Aviso>
      )}
      {idValido && !carregando && !erro && comunicacao && (
        <article className="sice-avisos__detalhes">
          <div className="sice-avisos__detalhes-cabecalho">
            <div><h2>{comunicacao.eventoTitulo}</h2><p>Comunicação de cancelamento #{comunicacao.id}</p></div>
            <EtiquetaStatusAviso status={comunicacao.status} contexto="cancelamento" />
          </div>

          <dl className="sice-avisos__dados">
            <dt>Evento</dt><dd><Link to={`/eventos/${comunicacao.eventoId}`}>Ver evento #{comunicacao.eventoId}</Link></dd>
            <dt>Grupo destinatário</dt><dd>{comunicacao.grupoNome} (#{comunicacao.grupoId})</dd>
            <dt>Aviso original</dt><dd><Link to={`/avisos/envios/${comunicacao.envioOriginalId}`}>Ver envio #{comunicacao.envioOriginalId}</Link></dd>
            <dt>Identificador do grupo utilizado</dt><dd>{comunicacao.identificadorGrupo}</dd>
            <dt>Status da comunicação</dt><dd><EtiquetaStatusAviso status={comunicacao.status} contexto="cancelamento" /></dd>
            <dt>Tentativas registradas</dt><dd>{comunicacao.tentativas}</dd>
            <dt>Criado em</dt><dd>{formatarDataHoraAviso(comunicacao.criadoEm)}</dd>
            <dt>Processado em</dt><dd>{formatarDataHoraAviso(comunicacao.enviadoEm)}</dd>
            <dt>Último erro</dt><dd>{comunicacao.ultimoErro ? <DiagnosticoErroAviso diagnostico={comunicacao.diagnosticoErro} erroTecnico={comunicacao.ultimoErro} /> : "Nenhum erro registrado."}</dd>
            <dt>Mensagem de cancelamento</dt><dd><div className="sice-avisos__mensagem-erro sice-avisos__mensagem-conteudo">{comunicacao.mensagem}</div></dd>
          </dl>

          {comunicacao.status === "ERRO" && comunicacao.tentativas >= 3 && (
            <Aviso variante="alerta" titulo="Cancelamento sem confirmação após 3 tentativas" className="sice-avisos__orientacao-manual">
              <p>O SICE não recebeu confirmação do bot após as tentativas automáticas. Isso não comprova que a mensagem deixou de chegar ao WhatsApp.</p>
              <p><strong>O que fazer agora:</strong></p>
              <ol>
                <li>Verifique no grupo <strong>{comunicacao.grupoNome}</strong> se o cancelamento já foi comunicado.</li>
                <li>Se não foi recebido, comunique o cancelamento manualmente pelo WhatsApp.</li>
                <li>Consulte abaixo o histórico das tentativas e as possíveis falhas.</li>
              </ol>
              <p>Mensagens manuais não alteram o status registrado no SICE.</p>
            </Aviso>
          )}

          <section className="sice-avisos__historico" aria-labelledby="sice-historico-cancelamento">
            <div className="sice-avisos__titulo-bloco"><i className="bi bi-clock-history" aria-hidden="true" /><div><h3 id="sice-historico-cancelamento">Histórico individual de tentativas</h3><p>Acompanhe cada tentativa realizada pelo sistema.</p></div></div>
            {comunicacao.historico.length === 0 ? (
              <Aviso variante="informacao">Ainda não há tentativas registradas para esta comunicação.</Aviso>
            ) : (
              <>
                <div className="sice-avisos__rolagem sice-avisos__so-desktop">
                  <table>
                    <thead><tr><th>Nº</th><th>Início</th><th>Fim</th><th>Resultado</th><th>Detalhe</th></tr></thead>
                    <tbody>{comunicacao.historico.map((tentativa) => (
                      <tr key={tentativa.numero}>
                        <td>{tentativa.numero}</td>
                        <td>{formatarDataHoraAviso(tentativa.inicio)}</td>
                        <td>{formatarDataHoraAviso(tentativa.fim)}</td>
                        <td>{tentativa.resultado === "CONFIRMADO_PELO_BOT" ? "Confirmado pelo bot" : "Sem confirmação"}</td>
                        <td>{tentativa.erro ? <DiagnosticoErroAviso diagnostico={tentativa.diagnosticoErro} erroTecnico={tentativa.erro} /> : "Nenhum erro registrado."}</td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
                <div className="sice-avisos__cartoes sice-avisos__so-mobile">
                  {comunicacao.historico.map((tentativa) => (
                    <div className="sice-avisos__cartao" key={tentativa.numero}>
                      <h4>Tentativa {tentativa.numero}</h4>
                      <dl>
                        <dt>Início</dt><dd>{formatarDataHoraAviso(tentativa.inicio)}</dd>
                        <dt>Fim</dt><dd>{formatarDataHoraAviso(tentativa.fim)}</dd>
                        <dt>Resultado</dt><dd>{tentativa.resultado === "CONFIRMADO_PELO_BOT" ? "Confirmado pelo bot" : "Sem confirmação"}</dd>
                        <dt>Detalhe</dt><dd>{tentativa.erro ? <DiagnosticoErroAviso diagnostico={tentativa.diagnosticoErro} erroTecnico={tentativa.erro} /> : "Nenhum erro registrado."}</dd>
                      </dl>
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>

          <Aviso variante="informacao">“Confirmado pelo bot” indica resposta HTTP sem erro, <strong>não confirmação de entrega no WhatsApp</strong>. Falha de comunicação também não prova que a mensagem não foi entregue.</Aviso>
          <div className="sice-avisos__detalhes-acoes"><Botao type="button" variante="secundario" icone="bi-arrow-clockwise" onClick={() => setAtualizacao((n) => n + 1)}>Atualizar detalhes</Botao></div>
        </article>
      )}
    </main>
  );
}
