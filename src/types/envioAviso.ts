export type StatusEnvioAviso = "PENDENTE" | "ENVIADO" | "ERRO" | "CANCELADO";
export type StatusEventoEnvio = "ATIVO" | "CANCELADO" | "DESATIVADO";
export type TipoGrupoEnvio = "GERAL_ALUNOS" | "GERAL_PROFESSORES" | "TURMA";

export interface EnvioAviso {
  id: number;
  eventoId: number;
  eventoTitulo: string;
  eventoStatus: StatusEventoEnvio;
  eventoDataInicio: string;
  eventoHoraInicio: string;
  dataAviso: string;
  grupoId: number;
  grupoNome: string;
  grupoTipo: TipoGrupoEnvio;
  grupoAtivo: boolean;
  status: StatusEnvioAviso;
  tentativas: number;
  ultimaTentativaEm: string | null;
  enviadoEm: string | null;
  ultimoErro: string | null;
}

export interface PaginaEnvios {
  itens: EnvioAviso[];
  pagina: number;
  tamanho: number;
  total: number;
  totalPaginas: number;
}

export interface FiltrosEnvios {
  pagina: number;
  tamanho?: number;
  status?: StatusEnvioAviso;
  busca?: string;
}

/** Resultado observado na comunicacao HTTP com o bot (nao garante entrega). */
export interface TentativaEnvioAviso {
  id: number;
  numeroTentativa: number;
  iniciadaEm: string;
  finalizadaEm: string;
  resultado: "CONFIRMADO_PELO_BOT" | "SEM_CONFIRMACAO";
  detalheErro: string | null;
}
