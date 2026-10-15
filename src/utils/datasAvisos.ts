/** LocalDate e LocalDateTime do backend são horários civis de São Paulo, não UTC. */
export function formatarDataAviso(valor: string | null | undefined): string {
  if (!valor) return "—";
  const dia = valor.substring(0, 10);
  const partes = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dia);
  return partes ? `${partes[3]}/${partes[2]}/${partes[1]}` : valor;
}

export function formatarDataHoraAviso(valor: string | null | undefined): string {
  if (!valor) return "—";
  const data = formatarDataAviso(valor);
  const hora = valor.substring(11, 16);
  return /^\d{2}:\d{2}$/.test(hora) ? `${data} às ${hora}` : data;
}

export function hojeNaEscola(): string {
  const partes = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(new Date());
  const extrair = (tipo: string) => partes.find((p) => p.type === tipo)?.value ?? "";
  return `${extrair("year")}-${extrair("month")}-${extrair("day")}`;
}
