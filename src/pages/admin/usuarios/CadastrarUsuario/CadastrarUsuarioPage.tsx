import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import type { UsuarioFormData } from "../../../../schemas/usuarioSchema";
import { cadastrarUsuario } from "../../../../services/usuarioService";
import { listarTurma } from "../../../../services/turmaService";
import type { Turma } from "../../../../types/turmas";
import { isPerfilUsuario, PERFIL_LABEL_SINGULAR } from "../../../../utils/perfilUsuario";
import { mensagemErroApi } from "../../../../utils/erroApi";
import FormUsuario from "../../../../components/FormUsuario/FormUsuario";

import PaginaFormulario from "../../../../components/ui/PaginaFormulario";
import Aviso from "../../../../components/ui/Aviso";

export default function CadastrarUsuarioPage() {
    const { perfil } = useParams();
    const perfilValido = perfil && isPerfilUsuario(perfil) ? perfil : null;
    const navigate = useNavigate();
    const [turmas, setTurmas] = useState<Turma[]>([]);
    const [carregando, setCarregando] = useState(perfilValido === "ALUNO");
    const [erroCarregamento, setErroCarregamento] = useState("");
    const [erro, setErro] = useState("");
    const [salvando, setSalvando] = useState(false);
    useEffect(() => {
        if (perfilValido !== "ALUNO") return;
        async function carregar() {
            setCarregando(true); setErroCarregamento("");
            try { setTurmas((await listarTurma()).filter(turma => turma.ativo)); }
            catch (falha) { setErroCarregamento(mensagemErroApi(falha, "Não foi possível carregar as turmas.")); }
            finally { setCarregando(false); }
        }
        void carregar();
    }, [perfilValido]);
    async function cadastrar(dados: UsuarioFormData) {
        if (!perfilValido || salvando) return;
        setErro(""); setSalvando(true);
        try {
            await cadastrarUsuario({ ...dados, perfil: perfilValido, turmasIds: perfilValido === "ALUNO" ? dados.turmasIds : [] });
            navigate(`/gerenciarUsuarios/${perfilValido}`, { state: { aviso: "Usuário cadastrado com sucesso." } });
        } catch (falha) { setErro(mensagemErroApi(falha, "Não foi possível cadastrar o usuário.")); }
        finally { setSalvando(false); }
    }
    return (
        <PaginaFormulario
            titulo={`Cadastrar ${perfilValido ? PERFIL_LABEL_SINGULAR[perfilValido].toLowerCase() : "usuário"}`}
            descricao={"Informe os dados cadastrais e, para alunos, selecione as turmas vinculadas."}
            icone="bi-person-plus"
            voltarPara={`/gerenciarUsuarios/${perfilValido ?? "ALUNO"}`}
            textoVoltar="Voltar para usuários"
        >
            {!perfilValido ? (
                <Aviso variante="erro" role="alert">Perfil de usuário inválido.</Aviso>
            ) : carregando ? (
                <div className="sice-pagina-formulario__carregando" role="status"><i className="bi bi-hourglass-split" aria-hidden="true" />Carregando turmas...</div>
            ) : erroCarregamento ? (
                <Aviso variante="erro" role="alert">{erroCarregamento}</Aviso>
            ) : perfilValido === "ALUNO" && turmas.length === 0 ? (
                <Aviso variante="alerta" role="alert">Cadastre ou ative uma turma antes de cadastrar alunos.</Aviso>
            ) : (
                <>
                    {erro && <Aviso variante="erro" role="alert">{erro}</Aviso>}
                    <FormUsuario perfil={perfilValido} turmas={turmas} onSubmit={cadastrar} salvando={salvando} />
                </>
            )}
        </PaginaFormulario>
    );
}
