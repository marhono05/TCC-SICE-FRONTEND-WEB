import { api } from "./api";
import type { EnvioAviso, FiltrosEnvios, PaginaEnvios, TentativaEnvioAviso } from "../types/envioAviso";

/** API de consulta: nenhuma operação de envio ou alteração de status. */
export async function listarEnvios(filtros: FiltrosEnvios, signal?: AbortSignal): Promise<PaginaEnvios> {
  const resposta = await api.get<PaginaEnvios>("/avisos/envios", {
    params: filtros,
    signal,
  });
  return resposta.data;
}

export async function buscarEnvioPorId(id: number, signal?: AbortSignal): Promise<EnvioAviso> {
  const resposta = await api.get<EnvioAviso>(`/avisos/envios/${id}`, { signal });
  return resposta.data;
}

/** Consulta somente-leitura do historico individual de tentativas. */
export async function listarTentativasDoEnvio(id: number, signal?: AbortSignal): Promise<TentativaEnvioAviso[]> {
  const resposta = await api.get<TentativaEnvioAviso[]>(`/avisos/envios/${id}/tentativas`, { signal });
  return resposta.data;
}
