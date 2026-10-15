import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { mensagemErroApi } from "../../../../utils/erroApi";
import "../ListarAvisos/avisos.css";
import { buscarEnvioPorId, listarTentativasDoEnvio } from "../../../../services/envioAvisoService";
import type { StatusEnvioAviso, EnvioAviso, TentativaEnvioAviso } from "../../../../types/envioAviso";
import { formatarDataAviso, formatarDataHoraAviso } from "../../../../utils/datasAvisos";

const STATUS: Record<StatusEnvioAviso, string> = {
  PENDENTE: "Pendente", ENVIADO: "Processado pelo bot", ERRO: "Erro", CANCELADO: "Interrompido",
};

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
      <h1>Detalhes do aviso</h1>
      <p><Link to="/avisos">Voltar para a Central de Avisos</Link></p>
      {!idValido && <p role="alert">Identificador de envio inválido.</p>}
      {idValido && carregando && <p role="status">Carregando detalhes...</p>}
      {idValido && !carregando && erro && (
        <div className="sice-avisos__erro" role="alert"><p>{erro}</p><button type="button" onClick={() => setAtualizacao((n) => n + 1)}>Tentar novamente</button></div>
      )}
      {idValido && !carregando && !erro && envio && (
        <article className="sice-avisos__detalhes">
          <h2>{envio.eventoTitulo}</h2>
          <dl>
            <dt>Evento</dt><dd><Link to={`/eventos/${envio.eventoId}`}>Ver evento #{envio.eventoId}</Link></dd>
            <dt>Situação do evento</dt><dd>{envio.eventoStatus}</dd>
            <dt>Data do evento</dt><dd>{formatarDataAviso(envio.eventoDataInicio)} às {envio.eventoHoraInicio.slice(0, 5)}</dd>
            <dt>Data prevista do aviso</dt><dd>{formatarDataAviso(envio.dataAviso)}</dd>
            <dt>Grupo destinatário</dt><dd>{envio.grupoNome} (#{envio.grupoId})</dd>
            <dt>Tipo do grupo</dt><dd>{envio.grupoTipo}</dd>
            <dt>Situação do grupo</dt><dd>{envio.grupoAtivo ? "Ativo" : "Inativo"}</dd>
            <dt>Status do envio</dt><dd><strong>{STATUS[envio.status]}</strong></dd>
            <dt>Tentativas registradas</dt><dd>{envio.tentativas}</dd>
            <dt>Última tentativa</dt><dd>{formatarDataHoraAviso(envio.ultimaTentativaEm)}</dd>
            <dt>Processado em</dt><dd>{formatarDataHoraAviso(envio.enviadoEm)}</dd>
            <dt>Último erro</dt><dd className="sice-avisos__mensagem-erro">{envio.ultimoErro || "Nenhum erro registrado."}</dd>
          </dl>
          <h3>Histórico individual de tentativas</h3>
          {tentativas.length === 0 ? (
            <p className="sice-avisos__nota">Ainda não há tentativas detalhadas para este envio. Registros anteriores à implantação do histórico mantêm o contador e a última falha originais.</p>
          ) : (
            <div className="sice-avisos__rolagem">
              <table>
                <thead><tr><th>Nº</th><th>Início</th><th>Fim</th><th>Resultado</th><th>Detalhe</th></tr></thead>
                <tbody>{tentativas.map((tentativa) => (
                  <tr key={tentativa.id}>
                    <td>{tentativa.numeroTentativa}</td>
                    <td>{formatarDataHoraAviso(tentativa.iniciadaEm)}</td>
                    <td>{formatarDataHoraAviso(tentativa.finalizadaEm)}</td>
                    <td>{tentativa.resultado === "CONFIRMADO_PELO_BOT" ? "Confirmado pelo bot" : "Sem confirmação"}</td>
                    <td>{tentativa.detalheErro || "—"}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
          <p className="sice-avisos__nota">“Processado pelo bot” indica resposta HTTP sem erro, não confirmação de entrega no WhatsApp. Falha de comunicação também não prova que a mensagem não foi entregue.</p>
          <button type="button" onClick={() => setAtualizacao((n) => n + 1)}>Atualizar detalhes</button>
        </article>
      )}
    </main>
  );
}
