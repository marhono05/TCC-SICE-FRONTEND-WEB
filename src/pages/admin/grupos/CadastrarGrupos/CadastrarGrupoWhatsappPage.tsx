import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import type { GrupoWhatsappFormData } from "../../../../schemas/grupoWhatsappSchema";
import { cadastrarGrupo } from "../../../../services/grupoWhatsappService";
import { listarTurma } from "../../../../services/turmaService";
import type { Turma } from "../../../../types/turmas";
import { mensagemErroApi } from "../../../../utils/erroApi";
import FormGrupoWhatsapp from "../../../../components/FormGrupo/FormGrupoWhatsapp";

import PaginaFormulario from "../../../../components/ui/PaginaFormulario";
import Aviso from "../../../../components/ui/Aviso";

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
    return (
        <PaginaFormulario
            titulo={"Cadastrar grupo de WhatsApp"}
            descricao={"Vincule um grupo ao público destinatário correspondente."}
            icone="bi-whatsapp"
            voltarPara={"/gerenciarGruposWhatsapp"}
            textoVoltar="Voltar para grupos"
        >
            {carregando ? (
                <div className="sice-pagina-formulario__carregando" role="status"><i className="bi bi-hourglass-split" aria-hidden="true" />Carregando turmas...</div>
            ) : erroCarregamento ? (
                <Aviso variante="erro" role="alert">{erroCarregamento}</Aviso>
            ) : (
                <>
                    {erro && <Aviso variante="erro" role="alert">{erro}</Aviso>}
                    <FormGrupoWhatsapp turmas={turmas} onSubmit={cadastrar} salvando={salvando} />
                </>
            )}
        </PaginaFormulario>
    );
}
