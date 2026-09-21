import { useEffect, useState } from "react";
import { useParams } from "react-router";

import FormUsuario from "../../../../components/FormUsuario";

import {
    buscarUsuarioPorId,
    editarUsuario
} from "../../../../services/usuarioService";

import {
    listarTurma
} from "../../../../services/turmaService";

import type {
    Usuario,
    EditarUsuario
} from "../../../../types/usuario";

import type {
    Turma
} from "../../../../types/turmas";

import type {
    UsuarioFormData
} from "../../../../schemas/usuarioSchema";


export default function EditarUsuarioPage() {

    const { id } = useParams();

    const [usuario, setUsuario] =
        useState<Usuario | null>(null);

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


                /*
                 * Primeiro buscamos o usuário,
                 * porque precisamos descobrir
                 * qual é o perfil dele.
                 */
                const usuarioEncontrado =
                    await buscarUsuarioPorId(
                        Number(id)
                    );


                setUsuario(usuarioEncontrado);


                /*
                 * Só precisamos carregar turmas
                 * se o usuário for ALUNO.
                 */
                if (
                    usuarioEncontrado.perfil === "ALUNO"
                ) {

                    const turmasEncontradas =
                        await listarTurma();

                    setTurmas(turmasEncontradas);

                }

            } catch (error) {

                console.log(
                    "Erro ao carregar usuário"
                );

                console.log(error);

            } finally {

                setLoading(false);

            }
        }


        carregarDados();

    }, [id]);


    async function editar(
        dados: UsuarioFormData
    ) {

        if (!usuario) {
            return;
        }


        /*
         * Note que NÃO enviamos perfil.
         *
         * Ele existe no formulário para
         * validação, mas não pode ser alterado.
         */
        const usuarioEditado: EditarUsuario = {
            identificador: dados.identificador,
            nome: dados.nome,
            email: dados.email,
            turmasIds: dados.turmasIds
        };


        try {

            setSalvando(true);


            const usuarioAtualizado =
                await editarUsuario(
                    usuario.id,
                    usuarioEditado
                );


            setUsuario(usuarioAtualizado);

        } catch (error) {

            console.log(
                "Erro ao editar usuário"
            );

            console.log(error);

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


    if (!usuario) {

        return (
            <p>
                Usuário não encontrado.
            </p>
        );

    }


    return (

        <div>

            <h1>
                Editar Usuário
            </h1>


            <FormUsuario
                usuario={usuario}
                perfil={usuario.perfil}
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