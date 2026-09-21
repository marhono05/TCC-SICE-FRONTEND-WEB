import { useEffect, useState } from "react";
import { useParams } from "react-router";

import FormUsuario from "../../../../components/FormUsuario";

import { cadastrarUsuario } from "../../../../services/usuarioService";
import { listarTurma } from "../../../../services/turmaService";

import type { Turma } from "../../../../types/turmas";
import type { CriarUsuario } from "../../../../types/usuario";

import type { UsuarioFormData } from "../../../../schemas/usuarioSchema";

import {
    isPerfilUsuario,
    PERFIL_LABEL_PLURAL
} from "../../../../utils/perfilUsuario";


export default function CadastrarUsuarioPage() {

    const { perfil } = useParams();

    const [turmas, setTurmas] =
        useState<Turma[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [salvando, setSalvando] =
        useState(false);


    /*
     * Valida o perfil recebido pela URL.
     */
    const perfilValido =
        perfil && isPerfilUsuario(perfil)
            ? perfil
            : null;


    const titulo =
        perfilValido
            ? PERFIL_LABEL_PLURAL[perfilValido]
            : "Usuários";


    /*
     * Só precisamos carregar as turmas
     * quando estivermos cadastrando ALUNO.
     */
    useEffect(() => {

        async function carregarTurmas() {

            if (perfilValido !== "ALUNO") {

                setLoading(false);

                return;
            }


            try {

                setLoading(true);

                const dados =
                    await listarTurma();

                setTurmas(dados);

            } catch (error) {

                console.log(
                    "Erro ao carregar turmas"
                );

                console.log(error);

            } finally {

                setLoading(false);

            }
        }


        carregarTurmas();

    }, [perfilValido]);


    async function cadastrar(
        dados: UsuarioFormData
    ) {

        const novoUsuario: CriarUsuario = {
            identificador: dados.identificador,
            nome: dados.nome,
            email: dados.email,
            perfil: dados.perfil,
            turmasIds: dados.turmasIds
        };


        try {

            setSalvando(true);

            const usuarioCriado =
                await cadastrarUsuario(
                    novoUsuario
                );

            console.log(
                "Usuário criado:",
                usuarioCriado
            );

        } catch (error) {

            console.log(
                `Erro ao cadastrar ${perfilValido}`
            );

            console.log(error);

        } finally {

            setSalvando(false);

        }
    }


    /*
     * Caso alguém acesse uma URL com um
     * perfil inválido.
     */
    if (!perfilValido) {

        return (
            <p>
                Perfil de usuário inválido.
            </p>
        );

    }


    if (loading) {

        return (
            <p>
                Carregando...
            </p>
        );

    }


    return (

        <div>

            <h1>
                Cadastrar {titulo}
            </h1>


            <FormUsuario
                perfil={perfilValido}
                turmas={turmas}
                onSubmit={cadastrar}
            />


            {salvando && (
                <p>
                    Cadastrando usuário...
                </p>
            )}

        </div>

    );
}