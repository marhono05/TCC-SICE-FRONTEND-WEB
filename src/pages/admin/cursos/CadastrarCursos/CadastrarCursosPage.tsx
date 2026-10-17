import { useState } from "react";
import { useNavigate } from "react-router";
import type { CursoFormData } from "../../../../schemas/cursoSchema";
import { cadastrarCurso } from "../../../../services/cursoService";
import { mensagemErroApi } from "../../../../utils/erroApi";
import FormCurso from "../../../../components/FormCurso/FormCurso";

import PaginaFormulario from "../../../../layouts/PaginaFormulario/PaginaFormulario";
import Aviso from "../../../../components/ui/Aviso";

export default function CadastrarCursosPage() {
    const navigate = useNavigate();
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState("");
    async function cadastrar(dados: CursoFormData) {
        if (salvando) return;
        setSalvando(true); setErro("");
        try {
            await cadastrarCurso(dados);
            navigate("/gerenciarCursos", { state: { aviso: "Curso cadastrado com sucesso." } });
        } catch (falha) {
            setErro(mensagemErroApi(falha, "Não foi possível cadastrar o curso."));
        } finally { setSalvando(false); }
    }
    return (
        <PaginaFormulario
            titulo={"Cadastrar curso"}
            descricao={"Adicione um curso ao cadastro da instituição."}
            icone="bi-book"
            voltarPara={"/gerenciarCursos"}
            textoVoltar="Voltar para cursos"
        >
            {erro && <Aviso variante="erro" role="alert">{erro}</Aviso>}
            <FormCurso onSubmit={cadastrar} salvando={salvando} />
        </PaginaFormulario>
    );
}
