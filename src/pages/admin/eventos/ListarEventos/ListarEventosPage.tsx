import { useEffect, useState } from "react";
import { NavLink } from "react-router";

import type { Evento } from "../../../../types/evento";
import { cancelarEvento, listarTodos, reativarEvento } from "../../../../services/eventoService";

export default function ListarEventosPage() {

    const [loading, setLoading] = useState(false);
    const [eventos, setEventos] = useState<Evento[]>([]);

    async function listarEventos() {

        try {

            setLoading(true);

            const dados = await listarTodos();

            setEventos(dados);

        } catch (error) {

            console.error(
                "Erro ao listar eventos:",
                error
            );

        } finally {

            setLoading(false);

        }
    }

    useEffect(() => {

        listarEventos();

    }, []);

    async function desativar(id: number) {
        await cancelarEvento(id);
        listarEventos();
    }

    async function reativar(id: number) {
        await reativarEvento(id);
        listarEventos();
    }

    return (
        <div>
            <h1>
                Listagem de Eventos
            </h1>
            <NavLink to="/cadastrarEventos">
                Cadastrar Evento
            </NavLink>
            <br />
            <br />

            <table>
                <thead>
                    <tr>
                        <th>Id</th>
                        <th>Título</th>
                        <th>Data</th>
                        <th>Hora</th>
                        <th>Status</th>
                        <th>Destinos</th>
                        <th>Ações</th>
                    </tr>

                </thead>


                <tbody>

                    {loading ? (

                        <tr>
                            <td colSpan={7}>
                                Carregando...
                            </td>
                        </tr>

                    ) : eventos.length === 0 ? (

                        <tr>
                            <td colSpan={7}>
                                Nenhum evento encontrado.
                            </td>
                        </tr>

                    ) : (

                        eventos.map((evento) => (

                            <tr key={evento.id}>

                                <td>
                                    {evento.id}
                                </td>

                                <td>
                                    {evento.titulo}
                                </td>

                                <td>
                                    {evento.dataInicio}
                                </td>

                                <td>
                                    {evento.horaInicio}
                                </td>

                                <td>
                                    {evento.status}
                                </td>

                                <td>
                                    {evento.destinos
                                        .map((destino) =>
                                            destino.perfil === "ALUNO"
                                                ? "Alunos"
                                                : "Professores"
                                        )
                                        .join(", ")}

                                </td>

                                <td>

                                    <NavLink
                                        to={`/eventos/${evento.id}`}
                                    >
                                        Ver
                                    </NavLink>

                                    {" | "}

                                    <NavLink
                                        to={`/editarEventos/${evento.id}`}
                                    >
                                        Editar
                                    </NavLink>

                                    {" | "}

                                    {evento.status === "ATIVO" ? (
                                        <button onClick={() => desativar(evento.id)}>
                                            Cancelar
                                        </button>
                                    ) : (
                                        <button onClick={() => reativar(evento.id)}>
                                            Reativar
                                        </button>
                                    )}

                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}