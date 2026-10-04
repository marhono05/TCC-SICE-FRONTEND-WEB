import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

import FormGrupoWhatsapp from "../../../../components/FormGrupoWhatsapp";

import type { Turma } from "../../../../types/turmas";
import type { GrupoWhatsappFormData } from "../../../../schemas/grupoWhatsappSchema";

import { cadastrarGrupo } from "../../../../services/grupoWhatsappService";
import { listarTurma } from "../../../../services/turmaService";


export default function CadastrarGrupoWhatsappPage() {

    const navigate = useNavigate();

    const [turmas, setTurmas] = useState<Turma[]>([]);
    const [loading, setLoading] = useState(false);


    useEffect(() => {

        async function carregarTurmas() {

            try {

                const dados = await listarTurma();

                setTurmas(dados);

            } catch (error) {

                console.error(error);

            }

        }

        carregarTurmas();

    }, []);


    async function handleSubmit(
        dados: GrupoWhatsappFormData
    ) {

        try {

            setLoading(true);

            await cadastrarGrupo(dados);

        } catch (error) {

            console.error(error);

        } finally {

            setLoading(false);

        }

    }


    return (
        <div>

            <h1>
                Cadastrar Grupo do WhatsApp
            </h1>

            <FormGrupoWhatsapp
                turmas={turmas}
                onSubmit={handleSubmit}
            />

            {loading && (
                <p>
                    Salvando...
                </p>
            )}

        </div>
    );
}