import { notFound } from 'next/navigation';
import { Metadata } from 'next';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://gmc-traffic-production.up.railway.app';

interface RelatorioPublico {
  cliente: { id: string; nome: string; slug: string };
  relatorio: {
    id: string;
    tipo: string;
    periodoInicio: string;
    periodoFim: string;
    dados: DadosRelatorio | null;
    narrativa: string | null;
    destaques: Destaque[] | null;
    hierarquia: HierarquiaCampanha[] | null;
    pdfUrl: string | null;
    status: string;
    criadoEm: string;
  };
}

interface DadosRelatorio {
  periodo?: { inicio: string; fim: string };
  investimento_total?: number;
  leads_total?: number;
  vendas_total?: number;
  impressoes?: number;
  cliques?: number;
  ctr?: number;
  cpl?: number;
  cpa?: number;
  conversoes?: number;
  alcance?: number;
  resultado_principal?: {
    quantidade: number;
    label: string;
    custoPorResultado: number;
  };
  variacao_periodo_anterior?: Record<string, number>;
  campanhas?: CampanhaDados[];
  top_3_criativos?: CriativoTop[];
  proximos_passos?: string[];
  semaforo_saude?: 'verde' | 'amarelo' | 'vermelho';
  anuncios?: AnuncioPerformance[];
}

interface CampanhaDados {
  nome?: string;
  objetivo?: string;
  status?: string;
  investimento?: number;
  impressoes?: number;
  cliques?: number;
  ctr?: number;
  conversoes?: number;
  cpl?: number;
  cpa?: number;
  roas?: number;
}

interface AnuncioPerformance {
  nome?: string;
  campanha?: string;
  investimento?: number;
  impressoes?: number;
  cliques?: number;
  ctr?: number;
  conversoes?: number;
  cpl?: number;
  cpa?: number;
  preview_url?: string;
}

interface CriativoTop {
  nome?: string;
  tipo?: string;
  score?: number;
  ctr?: number;
  preview_url?: string;
}

interface Destaque {
  tipo?: string;
  titulo?: string;
  descricao?: string;
  icone?: string;
  sentimento?: 'positivo' | 'negativo' | 'neutro';
}

interface HierarquiaCampanha {
  campanha?: string;
  objetivo?: string;
  investimento?: number;
  resultado?: number;
  metricaPrincipal?: string;
  anuncios?: AnuncioPerformance[];
}

// --- Utilitários de formatação ---

function fmtMoeda(valor: number | undefined | null): string {
  if (valor == null || isNaN(valor)) return 'R$ 0,00';
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function fmtNumero(valor: number | undefined | null): string {
  if (valor == null || isNaN(valor)) return '0';
  return valor.toLocaleString('pt-BR');
}

function fmtPct(valor: number | undefined | null): string {
  if (valor == null || isNaN(valor)) return '0,00%';
  return valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%';
}

function fmtData(iso: string | undefined | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function labelObjetivo(obj: string | undefined): string {
  const map: Record<string, string> = {
    OUTCOME_AWARENESS: 'Reconhecimento',
    OUTCOME_ENGAGEMENT: 'Engajamento',
    OUTCOME_TRAFFIC: 'Tráfego',
    OUTCOME_LEADS: 'Leads',
    OUTCOME_SALES: 'Vendas',
    OUTCOME_APP_PROMOTION: 'App',
    REACH: 'Alcance',
    BRAND_AWARENESS: 'Reconhecimento',
    LINK_CLICKS: 'Tráfego',
    LEAD_GENERATION: 'Leads',
    CONVERSIONS: 'Conversões',
    MESSAGES: 'Mensagens',
    VIDEO_VIEWS: 'Visualizações',
    POST_ENGAGEMENT: 'Engajamento',
  };
  return map[obj || ''] || obj || '—';
}

function corVariacao(valor: number | undefined | null): string {
  if (valor == null) return 'text-slate-500';
  if (valor > 0) return 'text-emerald-600';
  if (valor < 0) return 'text-red-500';
  return 'text-slate-500';
}

function setaVariacao(valor: number | undefined | null): string {
  if (valor == null) return '';
  if (valor > 0) return '↑';
  if (valor < 0) return '↓';
  return '→';
}

function limparNomeCampanha(nome: string | undefined): string {
  if (!nome) return '—';
  return nome
    .replace(/\[GMC\]\s*/gi, '')
    .replace(/\s*-\s*(TOPO|MEIO|FUNDO)\s*/gi, '')
    .replace(/\s*\|\s*(ABO|CBO)\s*/gi, '')
    .trim();
}

// --- Fetch de dados ---

async function buscarRelatorio(slug: string): Promise<RelatorioPublico | null> {
  try {
    const res = await fetch(`${API_URL}/relatorios/publico/${slug}`, {
      next: { revalidate: 300 }, // Cache de 5 minutos
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// --- Metadata dinâmica ---

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await buscarRelatorio(slug);
  if (!data) {
    return { title: 'Relatório não encontrado | GMC Traffic' };
  }
  const periodo = `${fmtData(data.relatorio.periodoInicio)} a ${fmtData(data.relatorio.periodoFim)}`;
  return {
    title: `Relatório ${data.cliente.nome} | GMC Traffic`,
    description: `Relatório de performance de ${data.cliente.nome} — ${periodo}`,
    openGraph: {
      title: `Relatório ${data.cliente.nome}`,
      description: `Performance de campanhas — ${periodo}`,
    },
  };
}

// --- Componentes ---

function KpiCard({
  titulo,
  valor,
  variacao,
  prefixo,
}: {
  titulo: string;
  valor: string;
  variacao?: number | null;
  prefixo?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{titulo}</p>
      <p className="mt-1 text-2xl font-bold text-slate-900">
        {prefixo}{valor}
      </p>
      {variacao != null && (
        <p className={`mt-1 text-sm font-medium ${corVariacao(variacao)}`}>
          {setaVariacao(variacao)} {variacao > 0 ? '+' : ''}{fmtPct(variacao)} vs período anterior
        </p>
      )}
    </div>
  );
}

function SemaforoSaude({ valor }: { valor?: string | null }) {
  if (!valor) return null;
  const cores: Record<string, string> = {
    verde: 'bg-emerald-500',
    amarelo: 'bg-amber-400',
    vermelho: 'bg-red-500',
  };
  const labels: Record<string, string> = {
    verde: 'Saudável',
    amarelo: 'Atenção',
    vermelho: 'Crítico',
  };
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-sm font-medium text-slate-700 shadow-sm border border-slate-200">
      <span className={`inline-block h-2.5 w-2.5 rounded-full ${cores[valor] || 'bg-slate-400'}`} />
      {labels[valor] || valor}
    </span>
  );
}

// --- Página principal ---

export default async function RelatorioPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await buscarRelatorio(slug);

  if (!data) {
    notFound();
  }

  const { cliente, relatorio } = data;
  const dados = relatorio.dados;
  const variacoes = dados?.variacao_periodo_anterior;
  const periodo = `${fmtData(relatorio.periodoInicio)} a ${fmtData(relatorio.periodoFim)}`;

  // Determinar resultado principal
  const resultado = dados?.resultado_principal;
  const labelResultado = resultado?.label || 'Resultados';
  const qtdResultado = resultado?.quantidade ?? dados?.leads_total ?? dados?.conversoes ?? 0;
  const custoResultado = resultado?.custoPorResultado ?? dados?.cpl ?? dados?.cpa ?? 0;

  // Campanhas — da hierarquia ou dos dados diretos
  const campanhas: CampanhaDados[] =
    relatorio.hierarquia?.map((h) => ({
      nome: h.campanha,
      objetivo: h.objetivo,
      investimento: h.investimento,
      conversoes: h.resultado,
    })) ||
    dados?.campanhas ||
    [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <header className="mb-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              {cliente.nome}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Relatório de Performance — {periodo}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <SemaforoSaude valor={dados?.semaforo_saude} />
            {relatorio.pdfUrl && (
              <a
                href={relatorio.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Baixar PDF
              </a>
            )}
          </div>
        </div>
      </header>

      {/* KPIs */}
      <section className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          titulo="Investimento"
          valor={fmtMoeda(dados?.investimento_total)}
          variacao={variacoes?.investimento_total}
        />
        <KpiCard
          titulo={labelResultado}
          valor={fmtNumero(qtdResultado)}
          variacao={variacoes?.leads_total ?? variacoes?.conversoes}
        />
        <KpiCard
          titulo={`Custo por ${labelResultado.replace(/s$/, '')}`}
          valor={fmtMoeda(custoResultado)}
          variacao={variacoes?.cpl ?? variacoes?.cpa}
        />
        <KpiCard
          titulo="Alcance"
          valor={fmtNumero(dados?.alcance ?? dados?.impressoes)}
          variacao={variacoes?.impressoes}
        />
      </section>

      {/* Narrativa IA */}
      {relatorio.narrativa && (
        <section className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold text-slate-900">
            Análise Estratégica
          </h2>
          <div className="prose prose-slate max-w-none text-slate-700">
            {relatorio.narrativa.split('\n').map((p, i) =>
              p.trim() ? <p key={i} className="mb-3 leading-relaxed">{p}</p> : null
            )}
          </div>
        </section>
      )}

      {/* Destaques */}
      {relatorio.destaques && relatorio.destaques.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Destaques</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {relatorio.destaques.map((d, i) => (
              <div
                key={i}
                className={`rounded-xl border p-4 shadow-sm ${
                  d.sentimento === 'positivo'
                    ? 'border-emerald-200 bg-emerald-50'
                    : d.sentimento === 'negativo'
                    ? 'border-red-200 bg-red-50'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <p className="font-medium text-slate-900">
                  {d.icone && <span className="mr-2">{d.icone}</span>}
                  {d.titulo}
                </p>
                {d.descricao && (
                  <p className="mt-1 text-sm text-slate-600">{d.descricao}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Campanhas */}
      {campanhas.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Campanhas</h2>
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-left">
                  <th className="px-4 py-3 font-medium text-slate-600">Campanha</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Objetivo</th>
                  <th className="px-4 py-3 text-right font-medium text-slate-600">Investimento</th>
                  <th className="px-4 py-3 text-right font-medium text-slate-600">Resultados</th>
                </tr>
              </thead>
              <tbody>
                {campanhas.map((c, i) => (
                  <tr key={i} className="border-b border-slate-50 last:border-0">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {limparNomeCampanha(c.nome)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                        {labelObjetivo(c.objetivo)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-slate-700">
                      {fmtMoeda(c.investimento)}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-slate-900">
                      {fmtNumero(c.conversoes ?? c.cliques)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Anúncios por campanha (hierarquia) */}
      {relatorio.hierarquia && relatorio.hierarquia.some((h) => h.anuncios && h.anuncios.length > 0) && (
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Performance por Anúncio</h2>
          <div className="space-y-4">
            {relatorio.hierarquia
              .filter((h) => h.anuncios && h.anuncios.length > 0)
              .map((h, i) => (
                <div key={i} className="rounded-xl border border-slate-200 bg-white shadow-sm">
                  <div className="border-b border-slate-100 px-4 py-3">
                    <h3 className="font-medium text-slate-900">
                      {limparNomeCampanha(h.campanha)}
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-50 bg-slate-50/50 text-left">
                          <th className="px-4 py-2 font-medium text-slate-500">Anúncio</th>
                          <th className="px-4 py-2 text-right font-medium text-slate-500">Invest.</th>
                          <th className="px-4 py-2 text-right font-medium text-slate-500">Impr.</th>
                          <th className="px-4 py-2 text-right font-medium text-slate-500">Cliques</th>
                          <th className="px-4 py-2 text-right font-medium text-slate-500">CTR</th>
                          <th className="px-4 py-2 text-right font-medium text-slate-500">Result.</th>
                        </tr>
                      </thead>
                      <tbody>
                        {h.anuncios!.map((a, j) => (
                          <tr key={j} className="border-b border-slate-50 last:border-0">
                            <td className="px-4 py-2 text-slate-700">{a.nome || '—'}</td>
                            <td className="px-4 py-2 text-right text-slate-600">{fmtMoeda(a.investimento)}</td>
                            <td className="px-4 py-2 text-right text-slate-600">{fmtNumero(a.impressoes)}</td>
                            <td className="px-4 py-2 text-right text-slate-600">{fmtNumero(a.cliques)}</td>
                            <td className="px-4 py-2 text-right text-slate-600">{fmtPct(a.ctr)}</td>
                            <td className="px-4 py-2 text-right font-medium text-slate-900">
                              {fmtNumero(a.conversoes ?? a.cliques)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
          </div>
        </section>
      )}

      {/* Top Criativos */}
      {dados?.top_3_criativos && dados.top_3_criativos.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Top Criativos</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {dados.top_3_criativos.map((c, i) => (
              <div key={i} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-900">#{i + 1}</span>
                  {c.tipo && (
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                      {c.tipo}
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-700 line-clamp-2">{c.nome || 'Criativo'}</p>
                <div className="mt-3 flex gap-4 text-xs text-slate-500">
                  {c.score != null && <span>Score: <strong className="text-slate-700">{c.score}</strong></span>}
                  {c.ctr != null && <span>CTR: <strong className="text-slate-700">{fmtPct(c.ctr)}</strong></span>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Próximos Passos */}
      {dados?.proximos_passos && dados.proximos_passos.length > 0 && (
        <section className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Próximos Passos</h2>
          <ul className="space-y-2">
            {dados.proximos_passos.map((passo, i) => (
              <li key={i} className="flex items-start gap-3 text-slate-700">
                <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                  {i + 1}
                </span>
                <span className="leading-relaxed">{passo}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Footer */}
      <footer className="mt-12 border-t border-slate-200 pt-6 text-center text-sm text-slate-400">
        <p>Gerado em {fmtData(relatorio.criadoEm)} por GMC Traffic</p>
        <p className="mt-1">Gestão inteligente de tráfego pago</p>
      </footer>
    </div>
  );
}
