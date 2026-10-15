import axios from "axios";

export function mensagemErroApi(erro: unknown, padrao: string): string {
  if (!axios.isAxiosError(erro)) return padrao;
  const status = erro.response?.status;
  const dados: unknown = erro.response?.data;
  const detalhes = dados && typeof dados === "object" ? dados as Record<string, unknown> : null;
  const mensagem = detalhes?.mensagem ?? detalhes?.message ?? detalhes?.detail;

  if (status === 401) return "Sua sessão expirou. Entre novamente no sistema.";
  if (status === 403) return "Você não tem permissão para realizar esta ação.";
  if (typeof mensagem === "string" && status !== undefined && status >= 400 && status < 500) {
    return mensagem;
  }
  if (!erro.response) return "Não foi possível conectar ao servidor. Verifique se o backend está ligado.";
  return padrao;
}
