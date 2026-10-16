import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import type { GrupoWhatsappFormData } from "../../../../schemas/grupoWhatsappSchema";
import { cadastrarGrupo } from "../../../../services/grupoWhatsappService";
import { listarTurma } from "../../../../services/turmaService";
import type { Turma } from "../../../../types/turmas";
import { mensagemErroApi } from "../../../../utils/erroApi";
import FormGrupoWhatsapp from "../../../../components/FormGrupo/FormGrupoWhatsapp";

export default function CadastrarGrupoWhatsappPage() {
    const navigate = useNavigate();
    const [turmas, setTurmas] = useState<Turma[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erroCarregamento, setErroCarregamento] = useState("");
    const [erro, setErro] = useState("");
    const [salvando, setSalvando] = useState(false);
    useEffect(() => {
        async function carregar() {
            try { setTurmas((await listarTurma()).filter(turma => turma.ativo)); }
            catch (falha) { setErroCarregamento(mensagemErroApi(falha, "Não foi possível carregar as turmas.")); }
            finally { setCarregando(false); }
        }
        void carregar();
    }, []);
    async function cadastrar(dados: GrupoWhatsappFormData) {
        if (salvando) return;
        setSalvando(true); setErro("");
        try {
            await cadastrarGrupo(dados);
            navigate("/gerenciarGruposWhatsapp", { state: { aviso: "Grupo cadastrado com sucesso." } });
        } catch (falha) { setErro(mensagemErroApi(falha, "Não foi possível cadastrar o grupo. Verifique se já existe outro grupo com esse identificador ou tipo.")); }
        finally { setSalvando(false); }
    }
    return <main>
        <h1>Cadastrar Grupo do WhatsApp</h1>
        <p><Link to="/gerenciarGruposWhatsapp">Voltar à listagem</Link></p>
        {carregando ? <p>Carregando turmas...</p> : erroCarregamento ? <p role="alert">{erroCarregamento}</p> : <>
            {erro && <p role="alert">{erro}</p>}
            <FormGrupoWhatsapp turmas={turmas} onSubmit={cadastrar} salvando={salvando} />
        </>}
    </main>;
}
