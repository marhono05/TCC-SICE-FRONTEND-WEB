import { useState } from "react";
import { Link, useNavigate } from "react-router";
import type { CursoFormData } from "../../../../schemas/cursoSchema";
import { cadastrarCurso } from "../../../../services/cursoService";
import { mensagemErroApi } from "../../../../utils/erroApi";
import FormCurso from "../../../../components/FormCurso/FormCurso";

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
    return <main>
        <h1>Cadastrar Curso</h1>
        <p><Link to="/gerenciarCursos">Voltar à listagem</Link></p>
        {erro && <p role="alert">{erro}</p>}
        <FormCurso onSubmit={cadastrar} salvando={salvando} />
    </main>;
}
