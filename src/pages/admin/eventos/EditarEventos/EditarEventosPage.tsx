import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { buscarEventoPorId, editarEvento } from "../../../../services/eventoService";
import { listarTurma } from "../../../../services/turmaService";
import type { EditarEvento, Evento } from "../../../../types/evento";
import type { Turma } from "../../../../types/turmas";
import type { EventoFormData } from "../../../../schemas/eventoSchema";
import { mensagemErroApi } from "../../../../utils/erroApi";
import FormEvento from "../../../../components/FormEvento/FormEvento";

import PaginaFormulario from "../../../../components/ui/PaginaFormulario";
import Aviso from "../../../../components/ui/Aviso";
import Botao from "../../../../components/ui/Botao";

export default function EditarEventosPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const eventoId = Number(id);
    const idValido = Number.isSafeInteger(eventoId) && eventoId > 0;

    const [evento, setEvento] = useState<Evento | null>(null);
    const [turmas, setTurmas] = useState<Turma[]>([]);
    const [loading, setLoading] = useState(true);
    const [erroCarregamento, setErroCarregamento] = useState("");
    const [erroEdicao, setErroEdicao] = useState("");
    const [salvando, setSalvando] = useState(false);
    const [tentativa, setTentativa] = useState(0);

    useEffect(() => {
        if (!idValido) { return; }
        let ativo = true;
        async function carregarDados() {
            setLoading(true);
            setErroCarregamento("");
            try {
                const [eventoEncontrado, turmasEncontradas] = await Promise.all([
                    buscarEventoPorId(eventoId), listarTurma()
                ]);
                if (ativo) {
                    setEvento(eventoEncontrado);
                    setTurmas(turmasEncontradas);
                }
            } catch (erro) {
                if (ativo) setErroCarregamento(mensagemErroApi(erro, "Não foi possível carregar o evento e as turmas."));
            } finally {
                if (ativo) setLoading(false);
            }
        }
        void carregarDados();
        return () => { ativo = false; };
    }, [eventoId, idValido, tentativa]);

    async function editar(dados: EventoFormData) {
        if (!idValido) return;
        setErroEdicao("");
        const atualizacao: EditarEvento = {
            titulo: dados.titulo,
            descricao: dados.descricao,
            dataInicio: dados.dataInicio,
            horaInicio: dados.horaInicio,
            destinos: dados.destinos
        };
        try {
            setSalvando(true);
            await editarEvento(eventoId, atualizacao);
            navigate(`/eventos/${eventoId}`, {
                replace: true,
                state: { aviso: "Evento atualizado com sucesso!" }
            });
        } catch (erro) {
            setErroEdicao(mensagemErroApi(erro, "Não foi possível editar o evento."));
        } finally {
            setSalvando(false);
        }
    }

    return (
        <PaginaFormulario
            titulo={"Editar evento"}
            descricao={"Atualize as informações e os destinatários do evento escolar."}
            icone="bi-calendar-event"
            voltarPara={"/gerenciarEventos"}
            textoVoltar="Voltar para eventos"
        >
            {!idValido && <Aviso variante="erro" role="alert">Identificador de evento inválido.</Aviso>}
            {idValido && loading && <div className="sice-pagina-formulario__carregando" role="status"><i className="bi bi-hourglass-split" aria-hidden="true" />Carregando evento...</div>}
            {idValido && !loading && erroCarregamento && (
                <Aviso variante="erro" role="alert">
                    {erroCarregamento}
                    <div className="sice-pagina-formulario__tentar-novamente">
                        <Botao type="button" variante="secundario" icone="bi-arrow-clockwise" onClick={() => setTentativa((n) => n + 1)}>Tentar novamente</Botao>
                    </div>
                </Aviso>
            )}
            {idValido && !loading && !erroCarregamento && !evento && <Aviso variante="informacao">Evento não encontrado.</Aviso>}
            {idValido && !loading && !erroCarregamento && evento && (
                <>
                    {erroEdicao && <Aviso variante="erro" role="alert">{erroEdicao}</Aviso>}
                    <FormEvento evento={evento} turmas={turmas} onSubmit={editar} salvando={salvando} />
                </>
            )}
        </PaginaFormulario>
    );
}
