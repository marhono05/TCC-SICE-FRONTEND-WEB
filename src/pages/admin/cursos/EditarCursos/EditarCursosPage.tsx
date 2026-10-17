import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import type { CursoFormData } from "../../../../schemas/cursoSchema";
import { buscarCursoPorId, editarCurso } from "../../../../services/cursoService";
import type { Curso } from "../../../../types/curso";
import { mensagemErroApi } from "../../../../utils/erroApi";
import FormCurso from "../../../../components/FormCurso/FormCurso";

import PaginaFormulario from "../../../../components/ui/PaginaFormulario";
import Aviso from "../../../../components/ui/Aviso";

export default function EditarCursosPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [curso, setCurso] = useState<Curso | null>(null);
    const [carregando, setCarregando] = useState(true);
    const [erroCarregamento, setErroCarregamento] = useState("");
    const [erro, setErro] = useState("");
    const [salvando, setSalvando] = useState(false);
    useEffect(() => {
        async function carregar() {
            if (!id || !Number.isSafeInteger(Number(id)) || Number(id) < 1) {
                setErroCarregamento("Identificador do curso inválido."); setCarregando(false); return;
            }
            try { setCurso(await buscarCursoPorId(Number(id))); }
            catch (falha) { setErroCarregamento(mensagemErroApi(falha, "Não foi possível carregar o curso.")); }
            finally { setCarregando(false); }
        }
        void carregar();
    }, [id]);
    async function editar(dados: CursoFormData) {
        if (!curso || salvando) return;
        setErro(""); setSalvando(true);
        try {
            await editarCurso(curso.id, dados);
            navigate("/gerenciarCursos", { state: { aviso: "Curso atualizado com sucesso." } });
        } catch (falha) { setErro(mensagemErroApi(falha, "Não foi possível editar o curso.")); }
        finally { setSalvando(false); }
    }
    return (
        <PaginaFormulario
            titulo={"Editar curso"}
            descricao={"Atualize o nome do curso cadastrado."}
            icone="bi-journal-text"
            voltarPara={"/gerenciarCursos"}
            textoVoltar="Voltar para cursos"
        >
            {carregando ? (
                <div className="sice-pagina-formulario__carregando" role="status"><i className="bi bi-hourglass-split" aria-hidden="true" />Carregando curso...</div>
            ) : erroCarregamento ? (
                <Aviso variante="erro" role="alert">{erroCarregamento}</Aviso>
            ) : !curso ? (
                <Aviso variante="informacao">Curso não encontrado.</Aviso>
            ) : (
                <>
                    {erro && <Aviso variante="erro" role="alert">{erro}</Aviso>}
                    <FormCurso curso={curso} onSubmit={editar} salvando={salvando} />
                </>
            )}
        </PaginaFormulario>
    );
}
