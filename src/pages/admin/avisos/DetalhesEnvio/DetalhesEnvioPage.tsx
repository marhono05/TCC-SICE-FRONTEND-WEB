import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { mensagemErroApi } from "../../../../utils/erroApi";
import "../ListarAvisos/avisos.css";
import { buscarEnvioPorId, listarTentativasDoEnvio } from "../../../../services/envioAvisoService";
import type { EnvioAviso, TentativaEnvioAviso } from "../../../../types/envioAviso";
import Botao from "../../../../components/ui/Botao";
import Aviso from "../../../../components/ui/Aviso";
import EtiquetaStatusAviso from "../../../../components/avisos/EtiquetaStatusAviso";
import DiagnosticoErroAviso from "../../../../components/avisos/DiagnosticoErroAviso";
import CabecalhoListagem from "../../../../components/ui/CabecalhoListagem";
import { formatarDataAviso, formatarDataHoraAviso } from "../../../../utils/datasAvisos";

export default function DetalhesEnvioPage() {
  const { id } = useParams();
  const envioId = Number(id);
  const idValido = Number.isSafeInteger(envioId) && envioId > 0;
  const [envio, setEnvio] = useState<EnvioAviso | null>(null);
  const [erro, setErro] = useState("");
  const [tentativas, setTentativas] = useState<TentativaEnvioAviso[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizacao, setAtualizacao] = useState(0);

  useEffect(() => {
    if (!idValido) return;
    const controller = new AbortController();
    async function carregar() {
      setCarregando(true);
      setErro("");
      setEnvio(null);
      setTentativas([]);
      try {
        const [dados, historico] = await Promise.all([
          buscarEnvioPorId(envioId, controller.signal),
          listarTentativasDoEnvio(envioId, controller.signal),
        ]);
        if (!controller.signal.aborted) {
          setEnvio(dados);
          setTentativas(historico);
        }
      } catch (falha) {
        if (!controller.signal.aborted) setErro(mensagemErroApi(falha, "Não foi possível consultar os detalhes do envio."));
      } finally {
        if (!controller.signal.aborted) setCarregando(false);
      }
    }
    void carregar();
    return () => controller.abort();
  }, [envioId, idValido, atualizacao]);

  return (
    <main className="sice-avisos">
      <CabecalhoListagem titulo="Detalhes do aviso" descricao="Consulte o resultado e as tentativas registradas para este grupo." icone="bi-journal-text" />
      <Link className="sice-avisos__voltar" to="/avisos"><i className="bi bi-arrow-left" aria-hidden="true" />Voltar para a Central de Avisos</Link>
      {!idValido && <Aviso variante="erro" role="alert">Identificador de envio inválido.</Aviso>}
      {idValido && carregando && <p className="sice-avisos__carregando" role="status"><i className="bi bi-hourglass-split" aria-hidden="true" />Carregando detalhes...</p>}
      {idValido && !carregando && erro && (
        <Aviso variante="erro" titulo="Falha ao carregar detalhes" role="alert">{erro}<div className="sice-avisos__aviso-acao"><Botao type="button" variante="secundario" icone="bi-arrow-clockwise" onClick={() => setAtualizacao((n) => n + 1)}>Tentar novamente</Botao></div></Aviso>
      )}
      {idValido && !carregando && !erro && envio && (
        <article className="sice-avisos__detalhes">
          <div className="sice-avisos__detalhes-cabecalho">
            <div><h2>{envio.eventoTitulo}</h2><p>Operação de aviso #{envio.id}</p></div>
            <EtiquetaStatusAviso status={envio.status} />
          </div>
          <dl className="sice-avisos__dados">
            <dt>Evento</dt><dd><Link to={`/eventos/${envio.eventoId}`}>Ver evento #{envio.eventoId}</Link></dd>
            <dt>Situação do evento</dt><dd>{envio.eventoStatus}</dd>
            <dt>Data do evento</dt><dd>{formatarDataAviso(envio.eventoDataInicio)} às {envio.eventoHoraInicio.slice(0, 5)}</dd>
            <dt>Data prevista do aviso</dt><dd>{formatarDataAviso(envio.dataAviso)}</dd>
            <dt>Grupo destinatário</dt><dd>{envio.grupoNome} (#{envio.grupoId})</dd>
            <dt>Tipo do grupo</dt><dd>{envio.grupoTipo}</dd>
            <dt>Situação do grupo</dt><dd>{envio.grupoAtivo ? "Ativo" : "Inativo"}</dd>
            <dt>Status do envio</dt><dd><EtiquetaStatusAviso status={envio.status} /></dd>
            <dt>Tentativas registradas</dt><dd>{envio.tentativas}</dd>
            <dt>Última tentativa</dt><dd>{formatarDataHoraAviso(envio.ultimaTentativaEm)}</dd>
            <dt>Processado em</dt><dd>{formatarDataHoraAviso(envio.enviadoEm)}</dd>
            <dt>Último erro</dt><dd>{envio.ultimoErro ? <DiagnosticoErroAviso diagnostico={envio.diagnosticoErro} erroTecnico={envio.ultimoErro} /> : "Nenhum erro registrado."}</dd>
          </dl>
          <section className="sice-avisos__historico" aria-labelledby="sice-historico-envio">
            <div className="sice-avisos__titulo-bloco"><i className="bi bi-clock-history" aria-hidden="true" /><div><h3 id="sice-historico-envio">Histórico individual de tentativas</h3><p>Acompanhe cada tentativa realizada pelo sistema.</p></div></div>
            {tentativas.length === 0 ? (
              <Aviso variante="informacao">Ainda não há tentativas detalhadas para este envio. Registros anteriores à implantação do histórico mantêm o contador e a última falha originais.</Aviso>
            ) : (
              <>
                <div className="sice-avisos__rolagem sice-avisos__so-desktop">
                  <table><thead><tr><th>Nº</th><th>Início</th><th>Fim</th><th>Resultado</th><th>Detalhe</th></tr></thead>
                    <tbody>{tentativas.map((tentativa) => (
                      <tr key={tentativa.id}>
                        <td>{tentativa.numeroTentativa}</td>
                        <td>{formatarDataHoraAviso(tentativa.iniciadaEm)}</td>
                        <td>{formatarDataHoraAviso(tentativa.finalizadaEm)}</td>
                        <td>{tentativa.resultado === "CONFIRMADO_PELO_BOT" ? "Confirmado pelo bot" : "Sem confirmação"}</td>
                        <td><DiagnosticoErroAviso diagnostico={tentativa.diagnosticoErro} erroTecnico={tentativa.detalheErro} /></td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
                <div className="sice-avisos__cartoes sice-avisos__so-mobile">
                  {tentativas.map((tentativa) => (
                    <div key={tentativa.id} className="sice-avisos__cartao">
                      <h4>Tentativa {tentativa.numeroTentativa}</h4>
                      <dl>
                        <dt>Início</dt><dd>{formatarDataHoraAviso(tentativa.iniciadaEm)}</dd>
                        <dt>Fim</dt><dd>{formatarDataHoraAviso(tentativa.finalizadaEm)}</dd>
                        <dt>Resultado</dt><dd>{tentativa.resultado === "CONFIRMADO_PELO_BOT" ? "Confirmado pelo bot" : "Sem confirmação"}</dd>
                        <dt>Detalhe</dt><dd><DiagnosticoErroAviso diagnostico={tentativa.diagnosticoErro} erroTecnico={tentativa.detalheErro} /></dd>
                      </dl>
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>
          <Aviso variante="informacao">“Processado pelo bot” indica resposta HTTP sem erro, <strong>não confirmação de entrega no WhatsApp</strong>. Falha de comunicação também não prova que a mensagem não foi entregue.</Aviso>
          <div className="sice-avisos__detalhes-acoes"><Botao type="button" variante="secundario" icone="bi-arrow-clockwise" onClick={() => setAtualizacao((n) => n + 1)}>Atualizar detalhes</Botao></div>
        </article>
      )}
    </main>
  );
}
