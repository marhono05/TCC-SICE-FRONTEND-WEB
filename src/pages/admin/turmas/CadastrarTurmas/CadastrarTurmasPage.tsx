import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import type { TurmaFormData } from "../../../../schemas/turmaSchemas";
import { listarCurso } from "../../../../services/cursoService";
import { cadastrarTurma } from "../../../../services/turmaService";
import type { Curso } from "../../../../types/curso";
import { mensagemErroApi } from "../../../../utils/erroApi";
import FormTurma from "../../../../components/FormTurma/FormTurma";

import PaginaFormulario from "../../../../components/ui/PaginaFormulario";
import Aviso from "../../../../components/ui/Aviso";

export default function CadastrarTurmasPage() {
    const navigate = useNavigate();
    const [cursos, setCursos] = useState<Curso[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erroCarregamento, setErroCarregamento] = useState("");
    const [erro, setErro] = useState("");
    const [salvando, setSalvando] = useState(false);
    useEffect(() => {
        async function carregar() {
            try { setCursos((await listarCurso()).filter(curso => curso.ativo)); }
            catch (falha) { setErroCarregamento(mensagemErroApi(falha, "Não foi possível carregar os cursos.")); }
            finally { setCarregando(false); }
        }
        void carregar();
    }, []);
    async function cadastrar(dados: TurmaFormData) {
        if (salvando) return;
        setErro(""); setSalvando(true);
        try {
            await cadastrarTurma(dados);
            navigate("/gerenciarTurmas", { state: { aviso: "Turma cadastrada com sucesso." } });
        } catch (falha) { setErro(mensagemErroApi(falha, "Não foi possível cadastrar a turma.")); }
        finally { setSalvando(false); }
    }
    return (
        <PaginaFormulario
            titulo={"Cadastrar turma"}
            descricao={"Informe o curso, o ano letivo, a etapa e a modalidade da turma."}
            icone="bi-mortarboard"
            voltarPara={"/gerenciarTurmas"}
            textoVoltar="Voltar para turmas"
        >
            {carregando ? (
                <div className="sice-pagina-formulario__carregando" role="status"><i className="bi bi-hourglass-split" aria-hidden="true" />Carregando cursos...</div>
            ) : erroCarregamento ? (
                <Aviso variante="erro" role="alert">{erroCarregamento}</Aviso>
            ) : cursos.length === 0 ? (
                <Aviso variante="alerta" role="alert">Cadastre ou ative um curso antes de cadastrar turmas.</Aviso>
            ) : (
                <>
                    {erro && <Aviso variante="erro" role="alert">{erro}</Aviso>}
                    <FormTurma cursos={cursos} onSubmit={cadastrar} salvando={salvando} />
                </>
            )}
        </PaginaFormulario>
    );
}
