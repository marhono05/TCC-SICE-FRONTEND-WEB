import { useState, useEffect } from "react";
import type { Evento } from "../../../types/evento";
import { listarMeusEventos } from "../../../services/eventoService";

export default function EventosPage() {

    const [eventos, setEventos] = useState<Evento[]>([]);
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function carregarEventos() {
            try {
                const eventos = await listarMeusEventos();

                setEventos(eventos)

            } catch (error) {
                console.log("Erro ao buscar eventos")
                console.log(error);
            } finally {
                setLoading(false)
            }
        }
        carregarEventos();
    }, []);

    if (loading) {
        return <p>Carregando eventos...</p>
    }

    return (
        <div>
            <h1>Eventos</h1>

            {eventos.map((evento) => (
                <div key={evento.id}>
                    <h2>{evento.titulo}</h2>
                    <p>{evento.descricao}</p>
                    <p>{evento.dataHoraInicio}</p>
                </div>
            ))}
            
        </div>
    )
}