
import type { DiagnosticoErroBot } from "./diagnosticoErroBot";
import type { Evento } from "./evento";

export type StatusComunicacaoCancelamento = "PENDENTE" | "ENVIADO" | "ERRO" | "CANCELADO";

/** A confirmação indica resposta do bot, não entrega ao participante. */
export type ResultadoTentativaCancelamento = "CONFIRMADO_PELO_BOT" | "SEM_CONFIRMACAO";

export interface TentativaComunicacaoCancelamento {
  numero: number;
  inicio: string;
  fim: string;
  resultado: ResultadoTentativaCancelamento;
  erro: string | null;
  diagnosticoErro?: DiagnosticoErroBot | null;
}

export interface ComunicacaoCancelamento {
  id: number;
  eventoId: number;
  grupoId: number;
  envioOriginalId: number;
  identificadorGrupo: string;
  mensagem: string;
  status: StatusComunicacaoCancelamento;
  tentativas: number;
  criadoEm: string;
  enviadoEm: string | null;
  ultimoErro: string | null;
  diagnosticoErro?: DiagnosticoErroBot | null;
  historico: TentativaComunicacaoCancelamento[];
}

export interface CancelamentoComAvisoResposta {
  evento: Evento;
  comunicacoesCriadas: number;
  gruposIgnoradosInativos: number;
}
