import { useEffect, useId, useRef, useState } from "react";
import "./ConfirmarCancelamentoEvento.css";
import { cancelarEventoComAviso } from "../../services/comunicacaoCancelamentoService";
import { cancelarEvento } from "../../services/eventoService";
import type { Evento } from "../../types/evento";
import { formatarDataAviso } from "../../utils/datasAvisos";
import { mensagemErroApi } from "../../utils/erroApi";

type Opcao = "sem-aviso" | "com-aviso";

interface Props {
  evento: Evento;
  onFechar: () => void;
  onConcluido: (atualizado: Evento, mensagem: string) => void;
}

/** O usuário decide de modo explícito qual endpoint invocar. */
export default function ConfirmarCancelamentoEvento({ evento, onFechar, onConcluido }: Props) {
  const [opcao, setOpcao] = useState<Opcao>("sem-aviso");
  const [processando, setProcessando] = useState(false);
  const [erro, setErro] = useState("");
  const enviandoRef = useRef(false);
  const botaoVoltar = useRef<HTMLButtonElement>(null);
  const tituloId = useId();
  const descricaoId = useId();

  useEffect(() => {
    botaoVoltar.current?.focus();
  }, []);

  useEffect(() => {
    function aoTeclar(eventoTecla: KeyboardEvent) {
      if (eventoTecla.key === "Escape" && !enviandoRef.current) onFechar();
    }
    document.addEventListener("keydown", aoTeclar);
    return () => document.removeEventListener("keydown", aoTeclar);
  }, [onFechar]);

  async function confirmar() {
    if (enviandoRef.current) return;
    enviandoRef.current = true;
    setProcessando(true);
    setErro("");
    try {
      if (opcao === "sem-aviso") {
        const atualizado = await cancelarEvento(evento.id);
        onConcluido(atualizado, "Evento cancelado no SICE, sem solicitação de comunicado pelo WhatsApp.");
      } else {
        const resultado = await cancelarEventoComAviso(evento.id);
        const criados = resultado.comunicacoesCriadas;
        const ignorados = resultado.gruposIgnoradosInativos;
        const resumo = criados === 0
          ? "Evento cancelado. Nenhum comunicado de cancelamento foi criado para processamento."
          : `Evento cancelado. ${criados} comunicado(s) criado(s) para processamento; acompanhe a confirmação na Central de Avisos.`;
        const complemento = ignorados > 0
          ? ` ${ignorados} grupo(s) inativo(s) não foram incluído(s).`
          : "";
        onConcluido(resultado.evento, resumo + complemento);
      }
    } catch (falha) {
      setErro(mensagemErroApi(falha, "Não foi possível confirmar o cancelamento."));
    } finally {
      enviandoRef.current = false;
      setProcessando(false);
    }
  }

  return (
    <div className="sice-cancelar__fundo">
      <section className="sice-cancelar__modal" role="dialog" aria-modal="true" aria-labelledby={tituloId} aria-describedby={descricaoId}>
        <h2 id={tituloId}>Cancelar evento</h2>
        <p id={descricaoId}>Confirme o cancelamento de <strong>{evento.titulo}</strong>, previsto para {formatarDataAviso(evento.dataInicio)} às {evento.horaInicio.slice(0, 5)}.</p>
        <fieldset disabled={processando} className="sice-cancelar__opcoes">
          <legend>Deseja comunicar o cancelamento aos grupos?</legend>
          <label>
            <input type="radio" name={`cancelar-${evento.id}`} checked={opcao === "sem-aviso"} onChange={() => setOpcao("sem-aviso")} />
            <span><strong>Não comunicar</strong><small>Cancelar somente no sistema, como antes.</small></span>
          </label>
          <label>
            <input type="radio" name={`cancelar-${evento.id}`} checked={opcao === "com-aviso"} onChange={() => setOpcao("com-aviso")} />
            <span><strong>Comunicar pelo WhatsApp</strong><small>Solicitar comunicado apenas aos grupos ativos cujo aviso original foi confirmado pelo bot.</small></span>
          </label>
        </fieldset>
        {opcao === "com-aviso" && (
          <p className="sice-cancelar__observacao">
            Somente eventos ainda futuros geram comunicados. Se não houver grupos elegíveis, o evento será cancelado sem mensagens.
            O número de comunicados criados aparecerá após a confirmação; confirmação do bot não garante entrega aos participantes.
          </p>
        )}
        {erro && (
          <p role="alert" className="sice-cancelar__erro">
            {erro} Se a conexão falhou, consulte o status do evento antes de tentar novamente, pois a operação pode ter sido concluída.
          </p>
        )}
        <div className="sice-cancelar__acoes">
          <button type="button" ref={botaoVoltar} disabled={processando} onClick={onFechar}>Voltar</button>
          <button type="button" disabled={processando} onClick={() => void confirmar()}>
            {processando ? "Confirmando..." : opcao === "com-aviso" ? "Cancelar e comunicar" : "Cancelar sem comunicar"}
          </button>
        </div>
      </section>
    </div>
  );
}
