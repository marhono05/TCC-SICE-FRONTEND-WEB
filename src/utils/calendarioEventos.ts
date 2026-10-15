import type { EventInput } from "@fullcalendar/core";
import type { Evento } from "../types/evento";

/** Mantém LocalDate/LocalTime como horário local (sem deslocamento UTC). */
export function converterEventosParaCalendario(eventos: Evento[]): EventInput[] {
    return eventos.map((evento) => ({
        id: String(evento.id),
        title: evento.titulo,
        start: `${evento.dataInicio}T${evento.horaInicio}`,
        allDay: false,
        classNames: [
            "sice-calendario__evento",
            `sice-calendario__evento--${evento.status.toLowerCase()}`,
        ],
        extendedProps: { status: evento.status },
    }));
}
