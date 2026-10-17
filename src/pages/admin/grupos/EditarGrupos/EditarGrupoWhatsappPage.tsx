import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import type { GrupoWhatsappFormData } from "../../../../schemas/grupoWhatsappSchema";
import { buscarGrupoPorId, editarGrupo } from "../../../../services/grupoWhatsappService";
import { listarTurma } from "../../../../services/turmaService";
import type { GrupoWhatsapp } from "../../../../types/grupoWhatsapp";
import type { Turma } from "../../../../types/turmas";
import { mensagemErroApi } from "../../../../utils/erroApi";
import FormGrupoWhatsapp from "../../../../components/FormGrupo/FormGrupoWhatsapp";

import PaginaFormulario from "../../../../components/ui/PaginaFormulario";
import Aviso from "../../../../components/ui/Aviso";

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
    return (
        <PaginaFormulario
            titulo={"Editar grupo de WhatsApp"}
            descricao={"Revise a identificação e os destinatários do grupo cadastrado."}
            icone="bi-whatsapp"
            voltarPara={"/gerenciarGruposWhatsapp"}
            textoVoltar="Voltar para grupos"
        >
            {carregando ? (
                <div className="sice-pagina-formulario__carregando" role="status"><i className="bi bi-hourglass-split" aria-hidden="true" />Carregando grupo...</div>
            ) : erroCarregamento ? (
                <Aviso variante="erro" role="alert">{erroCarregamento}</Aviso>
            ) : !grupo ? (
                <Aviso variante="informacao">Grupo não encontrado.</Aviso>
            ) : (
                <>
                    {erro && <Aviso variante="erro" role="alert">{erro}</Aviso>}
                    <FormGrupoWhatsapp grupo={grupo} turmas={turmas} onSubmit={editar} salvando={salvando} />
                </>
            )}
        </PaginaFormulario>
    );
}
