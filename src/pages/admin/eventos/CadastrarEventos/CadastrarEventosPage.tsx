import { useEffect, useState } from "react";

import FormEvento from "../../../../components/FormEvento";

import { listarTurma } from "../../../../services/turmaService";
import { cadastrarEvento } from "../../../../services/eventoService";

import type { Turma } from "../../../../types/turmas";
import type { CriarEvento } from "../../../../types/evento";
import type { EventoFormData } from "../../../../schemas/eventoSchema";


export default function CadastrarEventosPage() {

    const [turmas, setTurmas] = useState<Turma[]>([]);

    const [carregandoTurmas, setCarregandoTurmas] =
        useState(true);

    const [salvando, setSalvando] =
        useState(false);


    async function cadastrar(
        dados: EventoFormData
    ) {

        const novoEvento: CriarEvento = {
            titulo: dados.titulo,
            descricao: dados.descricao,
            dataInicio: dados.dataInicio,
            horaInicio: dados.horaInicio,
            destinos: dados.destinos
        };

        try {
            setSalvando(true);

            const eventoCriado =
                await cadastrarEvento(novoEvento);

            console.log(
                "Evento criado:",
                eventoCriado
            );

        } catch (error) {
            console.error(
                "Erro ao cadastrar evento:",
                error
            );

        } finally {
            setSalvando(false);
        }
    }


    useEffect(() => {
        async function carregarTurmas() {

            try {
                setCarregandoTurmas(true);

                const dados =
                    await listarTurma();

                setTurmas(dados);
            } catch (error) {
                console.error(
                    "Erro ao carregar turmas:",
                    error
                );
            } finally {

                setCarregandoTurmas(false);
            }
        }
        carregarTurmas();
    }, []);


    return (
        <div>
            <h1>
                Cadastro de Eventos
            </h1>

            {carregandoTurmas ? (
                <p>
                    Carregando turmas...
                </p>
            ) : (
                <>
                    <FormEvento
                        turmas={turmas}
                        onSubmit={cadastrar}
                    />

                    {salvando && (
                        <p>
                            Salvando evento...
                        </p>
                    )}
                </>
            )}
        </div>
    );
}