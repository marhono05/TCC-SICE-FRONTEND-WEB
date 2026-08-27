import type { PerfilUsuario } from "./auth";


export type Evento = {
    id: number;
    titulo: string;
    descricao: string;
    dataHoraInicio: string;
    status: string;
    perfisDestinados: PerfilUsuario[];
    etapasDestinadas: string[];
    modalidadesDestinadas: string[];
    turmasDestinadasIds: number[];
    criadoPor: number;
}