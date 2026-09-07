import { useParams } from "react-router";
import { isPerfilUsuario, PERFIL_LABEL_PLURAL } from "../../../../utils/perfilUsuario";
import { useEffect, useState, type SubmitEvent } from "react";
import { usuarioService } from "../../../../services/usuarioService";
import type { CriarUsuario } from "../../../../types/usuario";
import type { Turma } from "../../../../types/turmas";
import { listarTurma } from "../../../../services/turmaService";

export default function CadastrarUsuarioPage() {

    const { perfil } = useParams();

    const titulo =
        perfil && isPerfilUsuario(perfil)
            ? PERFIL_LABEL_PLURAL[perfil]
            : "Usuários";

    const [identificador, setIdentificador] = useState("");
    const [senha, setSenha] = useState("");
    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");

    const [turmas, setTurmas] = useState<Turma[]>([]);
    const [turmasSelecionadas, setTurmasSelecionadas] = useState<number[]>([]);
    const [pesquisa, setPesquisa] = useState("");

    const turmasFiltradas = turmas.filter((turma) => {
        const texto = `
            ${turma.cursoNome}
            ${turma.etapa}
            ${turma.modalidade}
            ${turma.anoLetivo}
        `.toLowerCase();

        return texto.includes(pesquisa.toLowerCase());
    });

    useEffect(() => {
        async function carregarTurmas() {
            const dados = await listarTurma();
            setTurmas(dados);
        }

        carregarTurmas();
    }, []);

    function selecionarTurma(id: number) {
        setTurmasSelecionadas((atuais) =>
            atuais.includes(id)
                ? atuais.filter((turmaId) => turmaId !== id)
                : [...atuais, id]
        );
    }

    async function cadastrar(
        event: SubmitEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        try {

            if (!perfil || !isPerfilUsuario(perfil)) {
                return;
            }

            const dados: CriarUsuario = {
                identificador,
                senha,
                nome,
                email,
                perfil,
                turmasIds: turmasSelecionadas
            };

            const usuarioCriado =
                await usuarioService.cadastrarUsuario(dados);

            console.log(usuarioCriado);

        } catch (error) {
            console.log(`Erro ao cadastrar um ${perfil}`);
            console.log(error);
        }
    }

    return (
        <div>
            <h1>Cadastrar {titulo}</h1>

            <form onSubmit={cadastrar}>

                <input
                    type="text"
                    placeholder="Digite o nome do usuário..."
                    value={nome}
                    onChange={(event) => setNome(event.target.value)}
                />

                <input
                    type="email"
                    placeholder="Digite o email do usuário..."
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                />

                <input
                    type="text"
                    placeholder="Digite o identificador do usuário..."
                    value={identificador}
                    onChange={(event) =>
                        setIdentificador(event.target.value)
                    }
                />

                <input
                    type="text"
                    placeholder="Digite a senha do usuário..."
                    value={senha}
                    onChange={(event) =>
                        setSenha(event.target.value)
                    }
                />

                {perfil === "ALUNO" && (
                    <div>

                        <input
                            type="text"
                            placeholder="Pesquisar turma..."
                            value={pesquisa}
                            onChange={(event) =>
                                setPesquisa(event.target.value)
                            }
                        />

                        {turmasFiltradas.map((turma) => (
                            <div key={turma.id}>
                                <label>
                                    <input
                                        type="checkbox"
                                        value={turma.id}
                                        checked={turmasSelecionadas.includes(
                                            turma.id
                                        )}
                                        onChange={() =>
                                            selecionarTurma(turma.id)
                                        }
                                    />

                                    {turma.cursoNome} -{" "}
                                    {turma.etapa} -{" "}
                                    {turma.modalidade} -{" "}
                                    {turma.anoLetivo}
                                </label>
                            </div>
                        ))}

                    </div>
                )}

                <button type="submit">
                    Cadastrar
                </button>

            </form>
        </div>
    );
}