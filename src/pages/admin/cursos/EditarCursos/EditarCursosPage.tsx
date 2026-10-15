import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import FormCurso from "../../../../components/FormCurso";
import type { CursoFormData } from "../../../../schemas/cursoSchema";
import { buscarCursoPorId, editarCurso } from "../../../../services/cursoService";
import type { Curso } from "../../../../types/curso";
import { mensagemErroApi } from "../../../../utils/erroApi";

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
    return <main>
        <h1>Editar Curso</h1>
        <p><Link to="/gerenciarCursos">Voltar à listagem</Link></p>
        {carregando ? <p>Carregando curso...</p> : erroCarregamento ? <p role="alert">{erroCarregamento}</p> : !curso ? <p role="alert">Curso não encontrado.</p> : <>
            {erro && <p role="alert">{erro}</p>}
            <FormCurso curso={curso} onSubmit={editar} salvando={salvando} />
        </>}
    </main>;
}
