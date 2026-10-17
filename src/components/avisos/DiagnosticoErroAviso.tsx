import type { DiagnosticoErroBot } from "../../types/diagnosticoErroBot";


interface Props {
  diagnostico?: DiagnosticoErroBot | null;
  erroTecnico?: string | null;
}

/** Exibe primeiro a explicacao para a secretaria; log original acessivel sob demanda. */
export default function DiagnosticoErroAviso({ diagnostico, erroTecnico }: Props) {
  if (!diagnostico && !erroTecnico) return <span>—</span>;

  return (
    <div className="sice-avisos__diagnostico">
      {diagnostico ? (
        <>
          <strong className="sice-avisos__diagnostico-titulo">{diagnostico.mensagem}</strong>
          <p className="sice-avisos__diagnostico-orientacao">{diagnostico.orientacao}</p>
        </>
      ) : (
        <p className="sice-avisos__diagnostico-orientacao">Não foi possível interpretar a falha. Consulte o detalhe técnico.</p>
      )}
      {erroTecnico && (
        <details className="sice-avisos__diagnostico-tecnico">
          <summary>Ver detalhes técnicos</summary>
          <pre>{erroTecnico}</pre>
        </details>
      )}
    </div>
  );
}
