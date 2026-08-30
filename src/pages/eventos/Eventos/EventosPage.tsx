import { useState, useEffect } from "react";
import type { Evento } from "../../../types/evento";
import { eventoService } from "../../../services/eventoService";
import { usuarioService } from "../../../services/usuarioService";
import { useAuth } from "../../../hooks/useAuth";

export default function EventosPage() {

    const [eventos, setEventos] = useState<Evento[]>([]);
    const [loading, setLoading] = useState(true)
    const { logout } = useAuth();


    async function testarListagem() {
        try {
            const usuarios = await usuarioService.listarPorPerfil("ALUNO");

            console.log(usuarios);
        } catch (error) {
            console.log("Erro ao listar usuários");
            console.log(error);
        }
    }

    useEffect(() => {
        async function carregarEventos() {
            try {
                const eventos = await eventoService.buscarMeusEventos();

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

            <button onClick={logout}>
                Sair
            </button>

            <button onClick={testarListagem}>
                Teste
            </button>

        </div>
    )
}