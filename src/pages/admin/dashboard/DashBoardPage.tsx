import { useEffect, useState } from "react";
import { Link } from "react-router";

import { useAuth } from "../../../hooks/useAuth";
import { listarMeusEventos, listarTodos as listarTodosEventos } from "../../../services/eventoService";
import { listarCurso } from "../../../services/cursoService";
import { listarTurma } from "../../../services/turmaService";
import { listarPorPerfil } from "../../../services/usuarioService";
import { listarTodos as listarTodosGrupos } from "../../../services/grupoWhatsappService";
import Botao from "../../../components/ui/Botao";
import Aviso from "../../../components/ui/Aviso";
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

function Estatistica({
  titulo, valor, icone, descricao, destaque = false,
}: {
  titulo: string;
  valor: number | null;
  icone: string;
  descricao?: string;
  destaque?: boolean;
}) {
  return (
    <div className={`sice-dashboard__estatistica${destaque ? " sice-dashboard__estatistica--destaque" : ""}`}>
      <div className="sice-dashboard__estatistica-topo">
        <dt>{titulo}</dt>
        <span className="sice-dashboard__estatistica-icone" aria-hidden="true">
          <i className={`bi ${icone}`} />
        </span>
      </div>
      <dd>{valor === null ? "—" : valor}</dd>
      {descricao && <small>{descricao}</small>}
    </div>
  );
}

function ListaEventos({
  titulo, icone, eventos, gerencia, vazio, cancelamentos = false,
}: {
  titulo: string;
  icone: string;
  eventos: Evento[];
  gerencia: boolean;
  vazio: string;
  cancelamentos?: boolean;
}) {
  return (
    <section className="sice-dashboard__painel" aria-label={titulo}>
      <div className="sice-dashboard__painel-cabecalho">
        <div className="sice-dashboard__painel-titulo">
          <span className={`sice-dashboard__painel-icone${cancelamentos ? " sice-dashboard__painel-icone--cancelamento" : ""}`} aria-hidden="true">
            <i className={`bi ${icone}`} />
          </span>
          <h2>{titulo}</h2>
        </div>
        <span className="sice-dashboard__quantidade" aria-label={`${eventos.length} evento(s)`}>
          {eventos.length}
        </span>
      </div>
      {eventos.length === 0 ? (
        <div className="sice-dashboard__vazio">
          <i className={`bi ${cancelamentos ? "bi-calendar-check" : "bi-calendar2-week"}`} aria-hidden="true" />
          <p>{vazio}</p>
        </div>
      ) : (
        <ul className="sice-dashboard__lista">
          {eventos.map((evento) => (
            <li key={evento.id}>
              <span className={`sice-dashboard__evento-marcador${cancelamentos ? " sice-dashboard__evento-marcador--cancelamento" : ""}`} aria-hidden="true">
                <i className={`bi ${cancelamentos ? "bi-calendar-x" : "bi-calendar-event"}`} />
              </span>
              <div className="sice-dashboard__evento-informacoes">
                <strong>{evento.titulo}</strong>
                <span className="sice-dashboard__evento-data">
                  <i className="bi bi-clock" aria-hidden="true" />
                  {dataLegivel(evento.dataInicio)} às {evento.horaInicio.slice(0, 5)}
                </span>
              </div>
              {gerencia && (
                <Link className="sice-dashboard__detalhes" to={`/eventos/${evento.id}`}>
                  Detalhes <i className="bi bi-arrow-right" aria-hidden="true" />
                </Link>
              )}
            </li>
          ))}
        </ul>
      )}
      {!gerencia && (
        <Link to="/eventos" className="sice-dashboard__atalho-calendario">
          Ver calendário mensal <i className="bi bi-arrow-right" aria-hidden="true" />
        </Link>
      )}
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

  // Mesmas consultas e regras de permissão do Dashboard original.
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
  const resumo = eventos ? resumirEventos(eventos, horarioAtual) : null;
  const nomePerfil = perfil ? NOMES_PERFIL[perfil] : "Usuário";

  return (
    <main className="sice-dashboard">
      <header className="sice-dashboard__cabecalho">
        <div className="sice-dashboard__identidade">
          <span className="sice-dashboard__identidade-icone" aria-hidden="true">
            <i className="bi bi-grid-1x2" />
          </span>
          <div className="sice-dashboard__cabecalho-texto">
            <span className="sice-dashboard__perfil">Painel {nomePerfil.toLowerCase()}</span>
            <h1>Painel — {nomePerfil}</h1>
            <p>{podeGerenciar
              ? "Acompanhe os principais dados e os próximos eventos da escola."
              : "Consulte os próximos eventos escolares destinados a você."}</p>
          </div>
        </div>
        <Botao
          type="button"
          variante="secundario"
          icone="bi-arrow-clockwise"
          onClick={() => setTentativa((n) => n + 1)}
          disabled={carregandoEventos || (ehAdmin && carregandoCadastros)}
          className="sice-dashboard__atualizar"
        >
          Atualizar dados
        </Botao>
      </header>

      {podeGerenciar && (
        <section className="sice-dashboard__secao" aria-labelledby="resumo-eventos">
          <div className="sice-dashboard__titulo-secao">
            <div>
              <h2 id="resumo-eventos">Resumo de eventos</h2>
              <p>Indicadores para acompanhar a programação escolar.</p>
            </div>
          </div>
          <dl className="sice-dashboard__grade sice-dashboard__grade--eventos">
            <Estatistica titulo="Eventos ativos (total)" icone="bi-calendar-check" valor={resumo?.totalAtivos ?? null} destaque />
            <Estatistica titulo="Eventos em 7 dias" icone="bi-calendar-week" valor={resumo?.semana ?? null} descricao="De hoje até os próximos 6 dias" />
            <Estatistica titulo="Cancelados em 7 dias" icone="bi-calendar-x" valor={resumo?.canceladosSemana ?? null} descricao="De hoje até os próximos 6 dias" />
          </dl>
        </section>
      )}

      {carregandoEventos && (
        <div className="sice-dashboard__aviso" role="status" aria-live="polite">
          <Aviso variante="informacao">Carregando informações de eventos...</Aviso>
        </div>
      )}
      {erroEventos && (
        <Aviso variante="erro" titulo="Erro ao carregar eventos" role="alert">
          {erroEventos} Use “Atualizar dados” para tentar novamente.
        </Aviso>
      )}

      {ehAdmin && (
        <section className="sice-dashboard__secao" aria-labelledby="resumo-cadastros">
          <div className="sice-dashboard__titulo-secao">
            <div>
              <h2 id="resumo-cadastros">Cadastros ativos da escola</h2>
              <p>Quantidade de registros ativos em cada categoria.</p>
            </div>
          </div>
          {carregandoCadastros && (
            <div className="sice-dashboard__aviso" role="status" aria-live="polite">
              <Aviso variante="informacao">Carregando cadastros...</Aviso>
            </div>
          )}
          {falhasCadastros.length > 0 && (
            <Aviso variante="erro" titulo="Dados indisponíveis" role="alert">
              Não foi possível consultar: {falhasCadastros.join(", ")}. Os valores indisponíveis aparecem como “—”.
            </Aviso>
          )}
          <dl className="sice-dashboard__grade sice-dashboard__grade--cadastros">
            <Estatistica titulo="Alunos" icone="bi-mortarboard" valor={cadastros.alunos} />
            <Estatistica titulo="Professores" icone="bi-person-workspace" valor={cadastros.professores} />
            <Estatistica titulo="Turmas" icone="bi-people" valor={cadastros.turmas} />
            <Estatistica titulo="Cursos" icone="bi-book" valor={cadastros.cursos} />
            <Estatistica titulo="Grupos WhatsApp" icone="bi-chat-dots" valor={cadastros.grupos} />
          </dl>
        </section>
      )}

      {resumo && (
        <div className="sice-dashboard__colunas">
          <ListaEventos
            titulo={podeGerenciar ? "Próximos eventos da escola" : "Eventos nos próximos proximos 7 dias"}
            icone="bi-calendar-event"
            eventos={podeGerenciar ? resumo.proximos : resumo.proximosSemana}
            gerencia={podeGerenciar}
            vazio={podeGerenciar ? "Nenhum evento futuro encontrado." : "Nenhum evento nos próximos 7 dias."}
          />
          <ListaEventos
            titulo="Eventos cancelados nos próximos 7 dias"
            icone="bi-calendar-x"
            eventos={podeGerenciar ? resumo.cancelados.slice(0, 3) : resumo.cancelados}
            gerencia={podeGerenciar}
            vazio="Nenhum cancelamento nesse período."
            cancelamentos
          />
        </div>
      )}

      <footer className="sice-dashboard__rodape">
        <i className="bi bi-clock-history" aria-hidden="true" />
        Horários e datas considerados no fuso da escola (São Paulo).
      </footer>
    </main>
  );
}
