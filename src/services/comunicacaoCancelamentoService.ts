import type {
  CancelamentoComAvisoResposta,
  ComunicacaoCancelamento,
  FiltrosComunicacoesCancelamento,
  PaginaComunicacoesCancelamento,
} from "../types/comunicacaoCancelamento";
import { api } from "./api";

/** Solicita explicitamente o cancelamento e a criação dos comunicados. */
export async function cancelarEventoComAviso(id: number): Promise<CancelamentoComAvisoResposta> {
  const resposta = await api.patch<CancelamentoComAvisoResposta>(`/eventos/${id}/cancelar-com-aviso`);
  return resposta.data;
}

/** Consulta por evento mantida para compatibilidade com o endpoint anterior. */
export async function listarComunicacoesCancelamento(
  eventoId: number, signal?: AbortSignal,
): Promise<ComunicacaoCancelamento[]> {
  const resposta = await api.get<ComunicacaoCancelamento[]>(
    `/eventos/${eventoId}/comunicacoes-cancelamento`, { signal },
  );
  return resposta.data;
}

/** Consulta geral paginada; não dispara nem reenvia mensagens. */
export async function listarTodasComunicacoesCancelamento(
  filtros: FiltrosComunicacoesCancelamento, signal?: AbortSignal,
): Promise<PaginaComunicacoesCancelamento> {
  const resposta = await api.get<PaginaComunicacoesCancelamento>("/avisos/cancelamentos", {
    params: filtros,
    signal,
  });
  return resposta.data;
}

/** Consulta os dados completos e as tentativas de uma comunicação específica. */
export async function buscarComunicacaoCancelamentoPorId(
  id: number, signal?: AbortSignal,
): Promise<ComunicacaoCancelamento> {
  const resposta = await api.get<ComunicacaoCancelamento>(`/avisos/cancelamentos/${id}`, { signal });
  return resposta.data;
}
