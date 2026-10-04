import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";

import FormGrupoWhatsapp from "../../../../components/FormGrupoWhatsapp";

import type { GrupoWhatsapp } from "../../../../types/grupoWhatsapp";
import type { Turma } from "../../../../types/turmas";

import type { GrupoWhatsappFormData } from "../../../../schemas/grupoWhatsappSchema";

import {
    buscarGrupoPorId,
    editarGrupo
} from "../../../../services/grupoWhatsappService";
import { listarTurma } from "../../../../services/turmaService";


export default function EditarGrupoWhatsappPage() {

    const { id } = useParams();

    const navigate = useNavigate();

    const [grupo, setGrupo] =
        useState<GrupoWhatsapp | null>(null);

    const [turmas, setTurmas] =
        useState<Turma[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [salvando, setSalvando] =
        useState(false);


    useEffect(() => {

        async function carregarDados() {

            try {

                setLoading(true);

                if (!id) {
                    return;
                }

                const grupoId = Number(id);

                const [
                    grupoEncontrado,
                    turmasEncontradas
                ] = await Promise.all([
                    buscarGrupoPorId(grupoId),
                    listarTurma()
                ]);

                setGrupo(grupoEncontrado);
                setTurmas(turmasEncontradas);

            } catch (error) {

                console.error(error);

            } finally {

                setLoading(false);
            }

        }

        carregarDados();

    }, [id]);


    async function handleSubmit(
        dados: GrupoWhatsappFormData
    ) {

        try {

            if (!id) {
                return;
            }

            setSalvando(true);

            await editarGrupo(
                Number(id),
                dados
            );

        } catch (error) {

            console.error(error);

        } finally {

            setSalvando(false);
        }

    }


    if (loading) {
        return (
            <p>
                Carregando...
            </p>
        );
    }


    if (!grupo) {
        return (
            <p>
                Grupo não encontrado.
            </p>
        );
    }


    return (
        <div>

            <h1>
                Editar Grupo do WhatsApp
            </h1>


            <FormGrupoWhatsapp
                grupo={grupo}
                turmas={turmas}
                onSubmit={handleSubmit}
            />


            {salvando && (
                <p>
                    Salvando...
                </p>
            )}

        </div>
    );
}