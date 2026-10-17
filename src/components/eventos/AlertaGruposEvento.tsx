import { useEffect, useMemo, useState } from "react";
import type { EventoFormData } from "../../schemas/eventoSchema";
import { verificarGruposDoEvento } from "../../services/eventoService";
import type { Turma } from "../../types/turmas";
import type { VerificacaoGruposEvento } from "../../types/evento";
import Aviso from "../ui/Aviso";

type Props = {
    destinos: EventoFormData["destinos"];
    turmas: Turma[];
};

type Estado =
    | { tipo: "erro"; assinatura: string }
    | { tipo: "resultado"; assinatura: string; dados: VerificacaoGruposEvento };

export default function AlertaGruposEvento({ destinos, turmas }: Props) {
    const [estado, setEstado] = useState<Estado | null>(null);
    const assinatura = JSON.stringify(destinos);
    const destinosValidos = useMemo(
        () => JSON.parse(assinatura) as EventoFormData["destinos"],
        [assinatura]
    );

    useEffect(() => {
        if (destinosValidos.length === 0) return;

        let ativo = true;
        const espera = window.setTimeout(() => {
            void verificarGruposDoEvento(destinosValidos)
                .then(dados => { if (ativo) setEstado({ tipo: "resultado", assinatura, dados }); })
                .catch(() => { if (ativo) setEstado({ tipo: "erro", assinatura }); });
        }, 400);

        return () => {
            ativo = false;
            window.clearTimeout(espera);
        };
    }, [destinosValidos, assinatura]);

    // A resposta de outros destinatários nunca deve aparecer durante uma nova verificação.
    if (destinosValidos.length === 0) return null;
    if (!estado || estado.assinatura !== assinatura) {
        return <Aviso variante="informacao" role="status">Verificando grupos de WhatsApp disponíveis...</Aviso>;
    }
    if (estado.tipo === "erro") return (
        <Aviso variante="alerta" role="status">Não foi possível verificar os grupos de WhatsApp agora. O evento ainda pode ser salvo.</Aviso>
    );
    const { totalGruposAtivos, destinosSemGrupo } = estado.dados;
    if (destinosSemGrupo.length === 0) return null;

    function descreverDestino(perfil: string, turmaId: number | null) {
        if (perfil === "PROFESSOR") return "Grupo geral de professores";
        if (turmaId == null) return "Grupo geral de alunos";
        const turma = turmas.find(t => t.id === turmaId);
        return turma
            ? `Grupo da turma: ${turma.cursoNome} — ${turma.anoLetivo} (${turma.modalidade} — ${turma.etapa})`
            : `Grupo da turma #${turmaId}`;
    }

    return (
        <Aviso role="alert" variante="alerta" titulo={totalGruposAtivos === 0
                ? "Nenhum grupo de WhatsApp disponível para os destinatários"
                : "Alguns destinatários estão sem grupo de WhatsApp"}>
            <p>Não há grupo ativo correspondente a:</p>
            <ul>
                {destinosSemGrupo.map((destino, index) => (
                    <li key={`${destino.perfil}-${destino.turmaId ?? "geral"}-${index}`}>
                        {descreverDestino(destino.perfil, destino.turmaId)}
                    </li>
                ))}
            </ul>
            <p>
                Você pode salvar o evento normalmente. Se esses grupos continuarem indisponíveis
                no momento do processamento, eles não receberão avisos pelo WhatsApp.
            </p>
        </Aviso>
    );
}
