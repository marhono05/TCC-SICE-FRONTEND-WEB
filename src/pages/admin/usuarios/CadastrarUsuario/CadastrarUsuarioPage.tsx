import { useParams } from "react-router"
import { isPerfilUsuario, PERFIL_LABEL_PLURAL } from "../../../../utils/perfilUsuario";
import { useState, type SubmitEvent } from "react";
import { usuarioService } from "../../../../services/usuarioService";
import type { CriarUsuario } from "../../../../types/usuario";

export default function CadastrarUsuarioPage() {

    const { perfil } = useParams();
    const titulo = perfil && isPerfilUsuario(perfil) ? PERFIL_LABEL_PLURAL[perfil] : "Usuários";

    const [identificador, setIdentificador] = useState('');
    const [senha, setSenha] = useState('');
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [turmasIds, setTurmasIds] = useState<number[]>([]);

    function alterarTurma(turmaId: number) {
        setTurmasIds((idsAtuais) => {
            if (idsAtuais.includes(turmaId)) {
                return idsAtuais.filter((id) => id !== turmaId);
            }

            return [...idsAtuais, turmaId];
        });
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
                turmasIds
            };

            const usuarioCriado = await usuarioService.cadastrarUsuario(dados);

        } catch (error) {

            console.log(`Erro ao cadastrar um ${perfil} `)
            console.log(error)

        }

    }

    return (
        <div>
            <h1>Cadastrar {titulo} </h1>
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
                    onChange={(event) => setIdentificador(event.target.value)}
                />
                <input
                    type="text"
                    placeholder="Digite a senha do usuário..."
                    value={senha}
                    onChange={(event) => setSenha(event.target.value)}
                />

            </form>
        </div>
    )
}