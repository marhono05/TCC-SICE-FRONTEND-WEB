import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import FormGrupoWhatsapp from "../../../../components/FormGrupoWhatsapp";
import type { GrupoWhatsappFormData } from "../../../../schemas/grupoWhatsappSchema";
import { buscarGrupoPorId, editarGrupo } from "../../../../services/grupoWhatsappService";
import { listarTurma } from "../../../../services/turmaService";
import type { GrupoWhatsapp } from "../../../../types/grupoWhatsapp";
import type { Turma } from "../../../../types/turmas";
import { mensagemErroApi } from "../../../../utils/erroApi";

export default function EditarGrupoWhatsappPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [grupo, setGrupo] = useState<GrupoWhatsapp | null>(null);
    const [turmas, setTurmas] = useState<Turma[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erroCarregamento, setErroCarregamento] = useState("");
    const [erro, setErro] = useState("");
    const [salvando, setSalvando] = useState(false);
    useEffect(() => {
        async function carregar() {
            if (!id || !Number.isSafeInteger(Number(id)) || Number(id) < 1) {
                setErroCarregamento("Identificador do grupo inválido."); setCarregando(false); return;
            }
            try {
                const [grupoEncontrado, turmasEncontradas] = await Promise.all([buscarGrupoPorId(Number(id)), listarTurma()]);
                setGrupo(grupoEncontrado);
                setTurmas(turmasEncontradas.filter(turma => turma.ativo || turma.id === grupoEncontrado.turmaId));
            } catch (falha) { setErroCarregamento(mensagemErroApi(falha, "Não foi possível carregar o grupo e as turmas.")); }
            finally { setCarregando(false); }
        }
        void carregar();
    }, [id]);
    async function editar(dados: GrupoWhatsappFormData) {
        if (!grupo || salvando) return;
        setErro(""); setSalvando(true);
        try {
            await editarGrupo(grupo.id, dados);
            navigate("/gerenciarGruposWhatsapp", { state: { aviso: "Grupo atualizado com sucesso." } });
        } catch (falha) { setErro(mensagemErroApi(falha, "Não foi possível editar o grupo. Verifique se já existe outro grupo com esse identificador ou tipo.")); }
        finally { setSalvando(false); }
    }
    return <main>
        <h1>Editar Grupo do WhatsApp</h1>
        <p><Link to="/gerenciarGruposWhatsapp">Voltar à listagem</Link></p>
        {carregando ? <p>Carregando grupo...</p> : erroCarregamento ? <p role="alert">{erroCarregamento}</p> : !grupo ? <p role="alert">Grupo não encontrado.</p> : <>
            {erro && <p role="alert">{erro}</p>}
            <FormGrupoWhatsapp grupo={grupo} turmas={turmas} onSubmit={editar} salvando={salvando} />
        </>}
    </main>;
}
