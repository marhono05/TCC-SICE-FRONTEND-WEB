import { useEffect, useState } from "react";
import { NavLink } from "react-router";

import type { GrupoWhatsapp } from "../../../../types/grupoWhatsapp";

import {
    listarTodos,
    alterarStatusGrupo
} from "../../../../services/grupoWhatsappService";


export default function ListarGruposWhatsappPage() {

    const [grupos, setGrupos] = useState<GrupoWhatsapp[]>([]);
    const [loading, setLoading] = useState(false);


    async function carregarGrupos() {

        try {
            setLoading(true);

            const dados = await listarTodos();

            setGrupos(dados);

        } catch (error) {

            console.error(error);

        } finally {

            setLoading(false);
        }

    }


    useEffect(() => {
        carregarGrupos();
    }, []);


    async function alterarStatus(grupo: GrupoWhatsapp) {

        try {

            await alterarStatusGrupo(
                grupo.id,
                !grupo.ativo
            );

            await carregarGrupos();

        } catch (error) {

            console.error(error);
        }

    }


    function formatarTipo(tipo: GrupoWhatsapp["tipo"]) {

        switch (tipo) {

            case "GERAL_ALUNOS":
                return "Geral dos Alunos";

            case "GERAL_PROFESSORES":
                return "Geral dos Professores";

            case "TURMA":
                return "Turma";
        }

    }


    return (
        <div>

            <h1>
                Grupos do WhatsApp
            </h1>


            <NavLink to="/grupos-whatsapp/cadastrar">
                Cadastrar Grupo
            </NavLink>


            <br />
            <br />


            {loading ? (

                <p>
                    Carregando...
                </p>

            ) : grupos.length === 0 ? (

                <p>
                    Nenhum grupo cadastrado.
                </p>

            ) : (

                <table>

                    <thead>

                        <tr>
                            <th>Nome</th>

                            <th>
                                Identificador
                            </th>

                            <th>
                                Tipo
                            </th>

                            <th>
                                Turma
                            </th>

                            <th>
                                Status
                            </th>

                            <th>
                                Ações
                            </th>
                        </tr>

                    </thead>


                    <tbody>

                        {grupos.map((grupo) => (

                            <tr key={grupo.id}>

                                <td>
                                    {grupo.nome}
                                </td>


                                <td>
                                    {grupo.identificador}
                                </td>


                                <td>
                                    {formatarTipo(grupo.tipo)}
                                </td>


                                <td>
                                    {grupo.turmaDescricao ?? "-"}
                                </td>


                                <td>
                                    {grupo.ativo
                                        ? "Ativo"
                                        : "Inativo"
                                    }
                                </td>


                                <td>

                                    <NavLink
                                        to={`/grupos-whatsapp/editar/${grupo.id}`}
                                    >
                                        Editar
                                    </NavLink>


                                    {" "}


                                    <button
                                        type="button"
                                        onClick={() =>
                                            alterarStatus(grupo)
                                        }
                                    >

                                        {grupo.ativo
                                            ? "Desativar"
                                            : "Ativar"
                                        }

                                    </button>

                                </td>

                            </tr>

                        ))}

                    </tbody>

                </table>

            )}

        </div>
    );
}