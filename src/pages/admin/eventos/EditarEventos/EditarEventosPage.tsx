import { useEffect, useState } from "react";
import { useParams } from "react-router";

import FormEvento from "../../../../components/FormEvento";

import {
    buscarEventoPorId,
    editarEvento
} from "../../../../services/eventoService";

import { listarTurma } from "../../../../services/turmaService";

import type {
    EditarEvento,
    Evento
} from "../../../../types/evento";

import type { Turma } from "../../../../types/turmas";

import type {
    EventoFormData
} from "../../../../schemas/eventoSchema";


export default function EditarEventosPage() {

    const { id } = useParams();

    const [evento, setEvento] =
        useState<Evento | null>(null);

    const [turmas, setTurmas] =
        useState<Turma[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [salvando, setSalvando] =
        useState(false);


    useEffect(() => {

        async function carregarDados() {

            if (!id) {
                return;
            }

            try {

                setLoading(true);

                const [
                    eventoEncontrado,
                    turmasEncontradas
                ] = await Promise.all([
                    buscarEventoPorId(Number(id)),
                    listarTurma()
                ]);

                setEvento(eventoEncontrado);

                setTurmas(turmasEncontradas);

            } catch (error) {

                console.error(
                    "Erro ao carregar evento:",
                    error
                );

            } finally {

                setLoading(false);

            }
        }


        carregarDados();

    }, [id]);


    async function editar(
        dados: EventoFormData
    ) {

        if (!id) {
            return;
        }


        const eventoEditado: EditarEvento = {
            titulo: dados.titulo,
            descricao: dados.descricao,
            dataInicio: dados.dataInicio,
            horaInicio: dados.horaInicio,
            destinos: dados.destinos
        };


        try {

            setSalvando(true);

            const eventoAtualizado =
                await editarEvento(
                    Number(id),
                    eventoEditado
                );

            setEvento(eventoAtualizado);

        } catch (error) {

            console.error(
                "Erro ao editar evento:",
                error
            );

        } finally {

            setSalvando(false);

        }
    }


    if (loading) {

        return (
            <p>
                Carregando evento...
            </p>
        );

    }


    if (!evento) {

        return (
            <p>
                Evento não encontrado.
            </p>
        );

    }


    return (

        <div>

            <h1>
                Editar Evento
            </h1>


            <FormEvento
                evento={evento}
                turmas={turmas}
                onSubmit={editar}
            />


            {salvando && (
                <p>
                    Salvando alterações...
                </p>
            )}

        </div>

    );
}