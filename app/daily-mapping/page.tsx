'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect, useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { DailyEntryForm } from '@/components/daily-mapping/daily-entry-form';
import { IntentionsManager } from '@/components/daily-mapping/intentions-manager';
import { BookOpen, Target, TrendingUp, Brain, Calendar, ArrowLeft, Eye, Home } from 'lucide-react';
import Link from 'next/link';

export default function DailyMappingPage() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-black via-purple-950/20 to-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    redirect('/auth/login');
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-purple-950/20 to-black">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-purple-500/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/dashboard')}
                className="text-slate-300 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al Dashboard
              </Button>
              
              <div className="h-6 w-px bg-slate-700" />
              
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <Eye className="h-5 w-5 text-white" />
                </div>
                <span className="text-slate-300 font-medium">OBSERVADOR 4D</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                  <Home className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400">
              Sistema de Mapeo Diario
            </span>
          </h1>
          <p className="text-gray-400 text-lg">
            Observa, registra y analiza tu experiencia desde la perspectiva 4D
          </p>
        </div>

        {/* Main Content - Tabs */}
        <Tabs defaultValue="entry" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 mb-8">
            <TabsTrigger value="entry" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Nueva Entrada</span>
              <span className="sm:hidden">Entrada</span>
            </TabsTrigger>
            <TabsTrigger value="intentions" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">Intenciones</span>
              <span className="sm:hidden">Intent.</span>
            </TabsTrigger>
            <TabsTrigger value="statistics" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Estadísticas</span>
              <span className="sm:hidden">Stats</span>
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              <span className="hidden sm:inline">Insights IA</span>
              <span className="sm:hidden">IA</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Historial</span>
              <span className="sm:hidden">Hist.</span>
            </TabsTrigger>
          </TabsList>

          {/* Nueva Entrada */}
          <TabsContent value="entry">
            <DailyEntryForm />
          </TabsContent>

          {/* Intenciones */}
          <TabsContent value="intentions">
            <IntentionsManager />
          </TabsContent>

          {/* Estadísticas */}
          <TabsContent value="statistics">
            <StatisticsView />
          </TabsContent>

          {/* Insights IA */}
          <TabsContent value="insights">
            <InsightsPanel />
          </TabsContent>

          {/* Historial */}
          <TabsContent value="history">
            <EntriesHistory />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Statistics View Component
function StatisticsView() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    loadStats();
  }, [days]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/daily-mapping/statistics?days=${days}`);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12 text-gray-400">
        No se pudieron cargar las estadísticas
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Entradas"
          value={stats.overall.totalEntries}
          subtitle="registros"
        />
        <StatCard
          title="Racha Actual"
          value={stats.overall.currentStreak}
          subtitle="días consecutivos"
        />
        <StatCard
          title="Energía Promedio"
          value={stats.overall.avgEnergy.toFixed(1)}
          subtitle="/10"
        />
        <StatCard
          title="Cumplimiento"
          value={`${stats.overall.fulfillmentRate}%`}
          subtitle="intenciones"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-6 rounded-lg border border-purple-500/20 bg-gradient-to-br from-purple-900/20 to-blue-900/20">
          <h3 className="text-xl font-semibold mb-4">Emociones Más Frecuentes</h3>
          {stats.emotions.topEmotions.map((emotion: any, idx: number) => (
            <div key={idx} className="flex justify-between py-2">
              <span className="capitalize">{emotion.emotion}</span>
              <span className="text-purple-400">{emotion.count} veces</span>
            </div>
          ))}
        </div>

        <div className="p-6 rounded-lg border border-purple-500/20 bg-gradient-to-br from-purple-900/20 to-blue-900/20">
          <h3 className="text-xl font-semibold mb-4">Resumen del Período</h3>
          <div className="space-y-3">
            <div>
              <span className="text-gray-400">Sincronicidades:</span>
              <span className="ml-2 text-purple-400">{stats.overall.synchronicityCount}</span>
            </div>
            <div>
              <span className="text-gray-400">Mejor racha:</span>
              <span className="ml-2 text-purple-400">{stats.overall.longestStreak} días</span>
            </div>
            <div>
              <span className="text-gray-400">Estado emocional promedio:</span>
              <span className="ml-2 text-purple-400">{stats.overall.avgEmotional.toFixed(1)}/10</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, subtitle }: { title: string; value: any; subtitle: string }) {
  return (
    <div className="p-4 rounded-lg border border-purple-500/20 bg-gradient-to-br from-purple-900/10 to-blue-900/10">
      <div className="text-sm text-gray-400 mb-1">{title}</div>
      <div className="text-2xl font-bold text-purple-400">{value}</div>
      <div className="text-xs text-gray-500">{subtitle}</div>
    </div>
  );
}

// Insights Panel Component
function InsightsPanel() {
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const generateInsights = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/daily-mapping/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ days: 30 }),
      });

      if (res.ok) {
        const data = await res.json();
        setInsights(data);
      }
    } catch (error) {
      console.error('Error generating insights:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
            Insights del Observador 4D
          </h2>
          <p className="text-gray-400 text-sm">Análisis profundo de tu evolución</p>
        </div>
        <button
          onClick={generateInsights}
          disabled={loading}
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50"
        >
          {loading ? 'Generando...' : 'Generar Análisis'}
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
            <p className="mt-4 text-gray-400">Analizando tus patrones con IA...</p>
          </div>
        </div>
      )}

      {insights && (
        <div className="space-y-6">
          <div className="p-6 rounded-lg border border-purple-500/20 bg-gradient-to-br from-purple-900/20 to-blue-900/20">
            <h3 className="text-xl font-semibold mb-4">Análisis Completo</h3>
            <div className="prose prose-invert max-w-none">
              <p className="text-gray-300 whitespace-pre-wrap">{insights.insights}</p>
            </div>
          </div>

          {insights.summary && (
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border border-purple-500/10 bg-purple-900/10">
                <div className="text-sm text-gray-400 mb-1">Período Analizado</div>
                <div className="text-xl font-bold text-purple-400">{insights.summary.period} días</div>
              </div>
              <div className="p-4 rounded-lg border border-purple-500/10 bg-purple-900/10">
                <div className="text-sm text-gray-400 mb-1">Entradas Totales</div>
                <div className="text-xl font-bold text-purple-400">{insights.summary.totalEntries}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {!insights && !loading && (
        <div className="text-center py-12 text-gray-400">
          <Brain className="h-12 w-12 mx-auto mb-4 text-gray-600" />
          <p>Genera un análisis IA para obtener insights profundos sobre tu evolución</p>
        </div>
      )}
    </div>
  );
}

// Entries History Component
function EntriesHistory() {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      const res = await fetch('/api/daily-mapping/entries?limit=30');
      if (res.ok) {
        const data = await res.json();
        setEntries(data);
      }
    } catch (error) {
      console.error('Error loading entries:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Cargando historial...</p>
        </div>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-600" />
        <p>No hay entradas registradas aún</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {entries.map((entry) => (
        <div
          key={entry.id}
          className="p-6 rounded-lg border border-purple-500/20 bg-gradient-to-br from-purple-900/10 to-blue-900/10 hover:border-purple-500/40 transition-colors"
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold">
                {new Date(entry.date).toLocaleDateString('es-ES', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </h3>
              <div className="flex gap-4 text-sm text-gray-400 mt-1">
                <span>Energía: {entry.energyLevel}/10</span>
                <span>Emocional: {entry.emotionalState}/10</span>
              </div>
            </div>
          </div>

          {entry.significantEvents && (
            <div className="mb-3">
              <h4 className="text-sm font-semibold text-purple-400 mb-1">Eventos Significativos</h4>
              <p className="text-gray-300 text-sm">{entry.significantEvents}</p>
            </div>
          )}

          {entry.mainThoughts && (
            <div className="mb-3">
              <h4 className="text-sm font-semibold text-purple-400 mb-1">Pensamientos Principales</h4>
              <p className="text-gray-300 text-sm">{entry.mainThoughts}</p>
            </div>
          )}

          {entry.synchronicities && (
            <div>
              <h4 className="text-sm font-semibold text-purple-400 mb-1">Sincronicidades</h4>
              <p className="text-gray-300 text-sm">{entry.synchronicities}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
