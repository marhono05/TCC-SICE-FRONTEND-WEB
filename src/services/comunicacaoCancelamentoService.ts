import type { CancelamentoComAvisoResposta, ComunicacaoCancelamento } from "../types/comunicacaoCancelamento";
import { api } from "./api";

/** Solicita explicitamente o cancelamento e a criação dos comunicados. */
export async function cancelarEventoComAviso(id: number): Promise<CancelamentoComAvisoResposta> {
  const resposta = await api.patch<CancelamentoComAvisoResposta>(`/eventos/${id}/cancelar-com-aviso`);
  return resposta.data;
}

/** Consulta de status e tentativas sem disparar mensagem. */
export async function listarComunicacoesCancelamento(
  eventoId: number, signal?: AbortSignal,
): Promise<ComunicacaoCancelamento[]> {
  const resposta = await api.get<ComunicacaoCancelamento[]>(
    `/eventos/${eventoId}/comunicacoes-cancelamento`, { signal },
  );
  return resposta.data;
}
