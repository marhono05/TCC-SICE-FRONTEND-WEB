import { useEffect, useState } from "react";
import { Link } from "react-router";

import { useAuth } from "../../../hooks/useAuth";
import { listarMeusEventos, listarTodos as listarTodosEventos } from "../../../services/eventoService";
import { listarCurso } from "../../../services/cursoService";
import { listarTurma } from "../../../services/turmaService";
import { listarPorPerfil } from "../../../services/usuarioService";
import { listarTodos as listarTodosGrupos } from "../../../services/grupoWhatsappService";
import type { Evento } from "../../../types/evento";
import { mensagemErroApi } from "../../../utils/erroApi";
import { dataLegivel, horarioDaEscola, resumirEventos } from "../../../utils/resumoDashboard";
import type { PerfilUsuario } from "../../../schemas/perfilUsuarioSchema";
import "./DashBoardStyle.css";

type IndicadorCadastro = "alunos" | "professores" | "turmas" | "cursos" | "grupos";
type ContagensCadastros = Record<IndicadorCadastro, number | null>;

const contagensVazias: ContagensCadastros = {
  alunos: null,
  professores: null,
  turmas: null,
  cursos: null,
  grupos: null,
};

const NOMES_PERFIL: Record<PerfilUsuario, string> = {
  ADMIN: "Administração",
  SECRETARIA: "Secretaria",
  PROFESSOR: "Professor",
  ALUNO: "Aluno",
};

function Estatistica({ titulo, valor, descricao }: { titulo: string; valor: number | null; descricao?: string }) {
  return (
    <div className="sice-dashboard__estatistica">
      <dt>{titulo}</dt>
      <dd>{valor === null ? "—" : valor}</dd>
      {descricao && <small>{descricao}</small>}
    </div>
  );
}

function ListaEventos({
  titulo, eventos, gerencia, vazio,
}: { titulo: string; eventos: Evento[]; gerencia: boolean; vazio: string }) {
  return (
    <section className="sice-dashboard__painel" aria-label={titulo}>
      <h2>{titulo}</h2>
      {eventos.length === 0 ? <p className="sice-dashboard__vazio">{vazio}</p> : (
        <ul className="sice-dashboard__lista">
          {eventos.map((evento) => (
            <li key={evento.id}>
              <div>
                <strong>{evento.titulo}</strong>
                <small>{dataLegivel(evento.dataInicio)} às {evento.horaInicio.slice(0, 5)}</small>
              </div>
              {gerencia && <Link to={`/eventos/${evento.id}`}>Detalhes</Link>}
            </li>
          ))}
        </ul>
      )}
      {!gerencia && <p className="sice-dashboard__observacao">Para consultar o evento no calendário, acesse a visualização mensal ou semanal.</p>}
    </section>
  );
}

export default function DashBoardPage() {
  const { usuario } = useAuth();
  const perfil = usuario?.perfil;
  const ehAdmin = perfil === "ADMIN";
  const podeGerenciar = ehAdmin || perfil === "SECRETARIA";

  const [eventos, setEventos] = useState<Evento[] | null>(null);
  const [carregandoEventos, setCarregandoEventos] = useState(true);
  const [erroEventos, setErroEventos] = useState("");
  const [cadastros, setCadastros] = useState<ContagensCadastros>(contagensVazias);
  const [carregandoCadastros, setCarregandoCadastros] = useState(false);
  const [falhasCadastros, setFalhasCadastros] = useState<string[]>([]);
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    let ativo = true;

    async function carregarEventos() {
      setCarregandoEventos(true);
      setErroEventos("");
      setEventos(null);
      try {
        // A listagem do perfil já faz o filtro seguro de destinos no backend.
        const dados = podeGerenciar ? await listarTodosEventos() : await listarMeusEventos();
        if (ativo) setEventos(dados);
      } catch (erro) {
        if (ativo) setErroEventos(mensagemErroApi(erro, "Não foi possível carregar os eventos do painel."));
      } finally {
        if (ativo) setCarregandoEventos(false);
      }
    }

    async function carregarCadastros() {
      setCarregandoCadastros(true);
      setCadastros(contagensVazias);
      setFalhasCadastros([]);

      // Essas cinco rotas são exclusivas do ADMIN; não são chamadas pelos demais perfis.
      const [alunos, professores, turmas, cursos, grupos] = await Promise.allSettled([
        listarPorPerfil("ALUNO"),
        listarPorPerfil("PROFESSOR"),
        listarTurma(),
        listarCurso(),
        listarTodosGrupos(),
      ]);
      if (!ativo) return;

      setCadastros({
        alunos: alunos.status === "fulfilled" ? alunos.value.filter((item) => item.ativo).length : null,
        professores: professores.status === "fulfilled" ? professores.value.filter((item) => item.ativo).length : null,
        turmas: turmas.status === "fulfilled" ? turmas.value.filter((item) => item.ativo).length : null,
        cursos: cursos.status === "fulfilled" ? cursos.value.filter((item) => item.ativo).length : null,
        grupos: grupos.status === "fulfilled" ? grupos.value.filter((item) => item.ativo).length : null,
      });
      const nomes = ["alunos", "professores", "turmas", "cursos", "grupos"];
      setFalhasCadastros([alunos, professores, turmas, cursos, grupos]
        .flatMap((resultado, index) => resultado.status === "rejected" ? [nomes[index]] : []));
      setCarregandoCadastros(false);
    }

    void carregarEventos();
    if (ehAdmin) void carregarCadastros();
    return () => { ativo = false; };
  }, [perfil, ehAdmin, podeGerenciar, tentativa]);

  const horarioAtual = horarioDaEscola(new Date());
  // Um horário novo é calculado a cada render; não há dependências omitidas no resumo.
  const resumo = eventos ? resumirEventos(eventos, horarioAtual) : null;

  const nomePerfil = perfil ? NOMES_PERFIL[perfil] : "Usuário";

  return (
    <main className="sice-dashboard">
      <div className="sice-dashboard__cabecalho">
        <div>
          <h1>Painel — {nomePerfil}</h1>
          <p>{podeGerenciar
            ? "Acompanhe os principais dados e os próximos eventos da escola."
            : "Consulte os próximos eventos escolares destinados a você."}</p>
        </div>
        <button type="button" onClick={() => setTentativa((n) => n + 1)}
          disabled={carregandoEventos || (ehAdmin && carregandoCadastros)}>
          Atualizar dados
        </button>
      </div>

      {podeGerenciar && (
        <section className="sice-dashboard__secao" aria-labelledby="resumo-eventos">
          <h2 id="resumo-eventos">Resumo de eventos</h2>
          <dl className="sice-dashboard__grade">
            <Estatistica titulo="Eventos ativos (total)" valor={resumo?.totalAtivos ?? null} />
            <Estatistica titulo="Eventos em 7 dias" valor={resumo?.semana ?? null} descricao="De hoje até os próximos 6 dias" />
            <Estatistica titulo="Cancelados em 7 dias" valor={resumo?.canceladosSemana ?? null} descricao="De hoje até os próximos 6 dias" />
          </dl>
        </section>
      )}

      {carregandoEventos && <p role="status">Carregando informações de eventos...</p>}
      {erroEventos && <p role="alert" className="sice-dashboard__erro">{erroEventos} Use “Atualizar dados” para tentar novamente.</p>}

      {ehAdmin && (
        <section className="sice-dashboard__secao" aria-labelledby="resumo-cadastros">
          <h2 id="resumo-cadastros">Cadastros ativos da escola</h2>
          {carregandoCadastros && <p role="status">Carregando cadastros...</p>}
          {falhasCadastros.length > 0 && (
            <p role="alert" className="sice-dashboard__erro">
              Não foi possível consultar: {falhasCadastros.join(", ")}. Os dados indisponíveis aparecem como “—”.
            </p>
          )}
          <dl className="sice-dashboard__grade">
            <Estatistica titulo="Alunos" valor={cadastros.alunos} />
            <Estatistica titulo="Professores" valor={cadastros.professores} />
            <Estatistica titulo="Turmas" valor={cadastros.turmas} />
            <Estatistica titulo="Cursos" valor={cadastros.cursos} />
            <Estatistica titulo="Grupos WhatsApp" valor={cadastros.grupos} />
          </dl>
        </section>
      )}

      {resumo && (
        <div className="sice-dashboard__colunas">
          <ListaEventos
            titulo={podeGerenciar ? "Próximos eventos da escola" : "Seus próximos eventos (7 dias)"}
            eventos={podeGerenciar ? resumo.proximos : resumo.proximosSemana}
            gerencia={podeGerenciar}
            vazio={podeGerenciar ? "Nenhum evento futuro encontrado." : "Nenhum evento nos próximos 7 dias."}
          />
          <ListaEventos
            titulo="Cancelamentos nos próximos 7 dias"
            eventos={podeGerenciar ? resumo.cancelados.slice(0, 3) : resumo.cancelados}
            gerencia={podeGerenciar}
            vazio="Nenhum cancelamento nesse período."
          />
        </div>
      )}
      <p className="sice-dashboard__rodape">Horários e datas considerados no fuso da escola (São Paulo).</p>
    </main>
  );
}
