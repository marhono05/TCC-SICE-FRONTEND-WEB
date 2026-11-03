
import type { DiagnosticoErroBot } from "./diagnosticoErroBot";
import type { Evento } from "./evento";

export type StatusComunicacaoCancelamento = "PENDENTE" | "ENVIADO" | "ERRO" | "CANCELADO";

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
  eventoTitulo: string;
  grupoId: number;
  grupoNome: string;
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

export interface ResumoComunicacaoCancelamento {
  id: number;
  eventoId: number;
  eventoTitulo: string;
  grupoId: number;
  grupoNome: string;
  status: StatusComunicacaoCancelamento;
  tentativas: number;
  criadoEm: string;
}

export interface CancelamentoComAvisoResposta {
  evento: Evento;
  comunicacoesCriadas: number;
  gruposIgnoradosInativos: number;
}

export interface FiltrosComunicacoesCancelamento {
  pagina: number;
  tamanho?: number;
  status?: StatusComunicacaoCancelamento;
  busca?: string;
  eventoId?: number;
}

export interface PaginaComunicacoesCancelamento {
  itens: ResumoComunicacaoCancelamento[];
  pagina: number;
  tamanho: number;
  total: number;
  totalPaginas: number;
}
