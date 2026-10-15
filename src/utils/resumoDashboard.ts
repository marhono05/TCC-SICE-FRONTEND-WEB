import type { Evento } from "../types/evento";

export type HorarioEscola = { data: string; hora: string };

/** O SICE agenda eventos no horário de São Paulo, independentemente do dispositivo. */
export function horarioDaEscola(agora: Date): HorarioEscola {
  const partes = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Sao_Paulo",
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(agora);
  const campos = Object.fromEntries(partes.map(({ type, value }) => [type, value]));
  return { data: `${campos.year}-${campos.month}-${campos.day}`, hora: `${campos.hour}:${campos.minute}` };
}

/** Soma dias à string LocalDate sem deslocamento por fuso horário. */
export function somarDias(data: string, quantidade: number): string {
  const [ano, mes, dia] = data.split("-").map(Number);
  const resultado = new Date(Date.UTC(ano, mes - 1, dia + quantidade));
  return resultado.toISOString().slice(0, 10);
}

export function dataLegivel(data: string): string {
  const [ano, mes, dia] = data.split("-");
  return `${dia}/${mes}/${ano}`;
}

function compararEventos(a: Evento, b: Evento): number {
  return (a.dataInicio + a.horaInicio).localeCompare(b.dataInicio + b.horaInicio);
}

export function resumirEventos(eventos: Evento[], horarioAtual: HorarioEscola) {
  // Período de sete dias corridos: hoje + os seis dias seguintes.
  const limiteSemana = somarDias(horarioAtual.data, 6);
  const ativos = eventos.filter((evento) => evento.status === "ATIVO");
  const cancelados = eventos.filter((evento) => evento.status === "CANCELADO");
  const nestaSemana = (evento: Evento) =>
    evento.dataInicio >= horarioAtual.data && evento.dataInicio <= limiteSemana;
  const futuro = (evento: Evento) =>
    evento.dataInicio > horarioAtual.data ||
    (evento.dataInicio === horarioAtual.data && evento.horaInicio.slice(0, 5) >= horarioAtual.hora);
  const eventosFuturos = ativos.filter(futuro).sort(compararEventos);
  const futurosDaSemana = eventosFuturos.filter(nestaSemana);
  const canceladosDaSemana = cancelados.filter(nestaSemana).sort(compararEventos);

  return {
    // Inclui eventos ativos antigos no total, como já acontecia no Dashboard.
    totalAtivos: ativos.length,
    // Apenas eventos que ainda vão ocorrer, entre hoje e os próximos seis dias.
    semana: futurosDaSemana.length,
    canceladosSemana: canceladosDaSemana.length,
    // A lista de gestão mantém o limite anterior de cinco eventos.
    proximos: eventosFuturos.slice(0, 5),
    // Para ALUNO/PROFESSOR, mostra todos os eventos que ocorrerão nos próximos sete dias.
    proximosSemana: futurosDaSemana,
    // O componente limita esta lista a três apenas para ADMIN/SECRETARIA.
    cancelados: canceladosDaSemana,
  };
}
