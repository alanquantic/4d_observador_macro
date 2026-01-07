'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  X, 
  Loader2,
  Target,
  ArrowRight,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react';

interface DecisionData {
  healthScore: number;
  topCritical: Array<{
    id: string;
    label: string;
    type: string;
    score: number;
    recommendation: string;
  }>;
  bottleneck: {
    id: string;
    label: string;
    type: string;
    coherence: number;
    issue: string;
  } | null;
  globalRecommendation: {
    action: string;
    target: string;
    reason: string;
  };
  metadata: {
    totalNodes: number;
    totalLinks: number;
    breakdown: {
      projects: number;
      relationships: number;
      intentions: number;
      manifestations: number;
    };
    lastUpdated: string;
  };
}

const TYPE_LABELS: Record<string, string> = {
  project: 'Proyecto',
  relationship: 'Relación',
  intention: 'Intención',
  manifestation: 'Manifestación',
  self: 'Observador',
};

const TYPE_COLORS: Record<string, string> = {
  project: '#ff00ff',
  relationship: '#ffaa00',
  intention: '#00ff88',
  manifestation: '#ff0088',
  self: '#00ffff',
};

const ACTION_STYLES: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
  Mantener: { bg: 'bg-green-500/20', text: 'text-green-400', icon: <CheckCircle className="w-5 h-5" /> },
  Invertir: { bg: 'bg-cyan-500/20', text: 'text-cyan-400', icon: <TrendingUp className="w-5 h-5" /> },
  Delegar: { bg: 'bg-blue-500/20', text: 'text-blue-400', icon: <ArrowRight className="w-5 h-5" /> },
  Corregir: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', icon: <AlertTriangle className="w-5 h-5" /> },
  Reformular: { bg: 'bg-orange-500/20', text: 'text-orange-400', icon: <RefreshCw className="w-5 h-5" /> },
  Cerrar: { bg: 'bg-red-500/20', text: 'text-red-400', icon: <XCircle className="w-5 h-5" /> },
};

interface DecisionModeProps {
  onClose: () => void;
}

export function DecisionMode({ onClose }: DecisionModeProps) {
  const [data, setData] = useState<DecisionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/decision-mode');
      if (!response.ok) {
        throw new Error('Error al cargar datos');
      }
      const result = await response.json();
      if (result.success) {
        setData(result);
      } else {
        throw new Error(result.error || 'Error desconocido');
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center">
        <div className="fixed inset-0 bg-black/95 backdrop-blur-sm" onClick={onClose} />
        <div className="relative z-10 text-center space-y-4">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-cyan-500/30 rounded-full animate-pulse" />
            <Loader2 className="w-10 h-10 text-cyan-400 animate-spin absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-cyan-400 text-xl font-light">Analizando tu sistema...</p>
          <p className="text-slate-400 text-sm">Calculando métricas de decisión</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center">
        <div className="fixed inset-0 bg-black/95 backdrop-blur-sm" onClick={onClose} />
        <Card className="relative z-10 bg-slate-900 border-red-500/50 p-8 max-w-md">
          <div className="text-center space-y-4">
            <AlertTriangle className="w-12 h-12 text-red-400 mx-auto" />
            <h2 className="text-xl font-bold text-white">Error al cargar</h2>
            <p className="text-slate-400">{error}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={fetchData}
                className="px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors"
              >
                Reintentar
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (!data) return null;

  const actionStyle = ACTION_STYLES[data.globalRecommendation.action] || ACTION_STYLES.Mantener;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/95 backdrop-blur-sm" 
        onClick={onClose}
      />
      {/* Modal Content */}
      <div className="relative z-10 w-full min-h-screen p-4 md:p-6 lg:p-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Target className="w-8 h-8 text-cyan-400" />
                <h1 className="text-3xl md:text-4xl font-bold text-white">Modo Decisión</h1>
              </div>
              <p className="text-slate-400">Resumen ejecutivo para toma de decisiones</p>
            </div>
            <button 
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-800 rounded-lg"
            >
              <X className="w-8 h-8" />
            </button>
          </div>

          {/* Health Score - Hero */}
          <Card className="bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/30 border-cyan-500/30 p-6 md:p-8 mb-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <p className="text-slate-400 text-sm uppercase tracking-wider mb-1">Salud del Sistema</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-6xl md:text-7xl font-bold text-white">{data.healthScore}</span>
                  <span className="text-2xl text-slate-400">%</span>
                </div>
                <p className="text-slate-500 text-sm mt-2">
                  {data.metadata.totalNodes} nodos · {data.metadata.totalLinks} conexiones
                </p>
              </div>
              
              <div className={`w-32 h-32 md:w-40 md:h-40 rounded-full flex items-center justify-center relative ${
                data.healthScore >= 70 ? 'bg-green-500/10' :
                data.healthScore >= 40 ? 'bg-yellow-500/10' :
                'bg-red-500/10'
              }`}>
                {/* Círculo de progreso */}
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                  <circle
                    cx="50%"
                    cy="50%"
                    r="45%"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    className="text-slate-800"
                  />
                  <circle
                    cx="50%"
                    cy="50%"
                    r="45%"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeDasharray={`${data.healthScore * 2.83} 283`}
                    className={
                      data.healthScore >= 70 ? 'text-green-400' :
                      data.healthScore >= 40 ? 'text-yellow-400' :
                      'text-red-400'
                    }
                  />
                </svg>
                
                {data.healthScore >= 70 ? (
                  <TrendingUp className="w-12 h-12 text-green-400" />
                ) : data.healthScore >= 40 ? (
                  <Zap className="w-12 h-12 text-yellow-400" />
                ) : (
                  <TrendingDown className="w-12 h-12 text-red-400" />
                )}
              </div>
            </div>
            
            {/* Breakdown */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800">
              {Object.entries(data.metadata.breakdown).map(([key, value]) => (
                <div key={key} className="text-center">
                  <div 
                    className="w-3 h-3 rounded-full mx-auto mb-2"
                    style={{ backgroundColor: TYPE_COLORS[key] || '#888' }}
                  />
                  <p className="text-2xl font-bold text-white">{value}</p>
                  <p className="text-xs text-slate-500 capitalize">
                    {key === 'projects' ? 'Proyectos' : 
                     key === 'relationships' ? 'Relaciones' : 
                     key === 'intentions' ? 'Intenciones' : 
                     key === 'manifestations' ? 'Manifestaciones' : key}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          {/* Two Column Layout */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Top 3 Críticos */}
            <Card className="bg-slate-900/80 border-slate-700 p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-orange-400" />
                <h2 className="text-lg font-semibold text-white">Top 3 Prioridades</h2>
              </div>
              
              <div className="space-y-3">
                {data.topCritical.map((node, index) => (
                  <div 
                    key={node.id}
                    className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-slate-500">#{index + 1}</span>
                        <div>
                          <p className="text-white font-medium">{node.label}</p>
                          <p 
                            className="text-xs"
                            style={{ color: TYPE_COLORS[node.type] || '#888' }}
                          >
                            {TYPE_LABELS[node.type] || node.type}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-cyan-400">{node.score}</p>
                        <p className="text-xs text-slate-500">Score</p>
                      </div>
                    </div>
                    <p className="text-sm text-slate-400">{node.recommendation}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Cuello de Botella + Recomendación Global */}
            <div className="space-y-6">
              {/* Cuello de Botella */}
              {data.bottleneck && (
                <Card className="bg-red-950/30 border-red-500/30 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                    <h2 className="text-lg font-semibold text-white">Cuello de Botella</h2>
                  </div>
                  
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-white font-medium text-lg">{data.bottleneck.label}</p>
                      <p 
                        className="text-sm"
                        style={{ color: TYPE_COLORS[data.bottleneck.type] || '#888' }}
                      >
                        {TYPE_LABELS[data.bottleneck.type] || data.bottleneck.type}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-red-400">
                        {(data.bottleneck.coherence * 100).toFixed(0)}%
                      </p>
                      <p className="text-xs text-slate-500">Coherencia</p>
                    </div>
                  </div>
                  
                  <p className="text-sm text-red-300/80">{data.bottleneck.issue}</p>
                </Card>
              )}

              {/* Recomendación Global */}
              <Card className={`border p-6 ${actionStyle.bg} ${actionStyle.text.replace('text-', 'border-')}/30`}>
                <div className="flex items-center gap-2 mb-4">
                  {actionStyle.icon}
                  <h2 className="text-lg font-semibold text-white">Acción Recomendada</h2>
                </div>
                
                <div className="flex items-center gap-4 mb-4">
                  <div className={`px-4 py-2 rounded-lg font-bold text-xl ${actionStyle.bg} ${actionStyle.text}`}>
                    {data.globalRecommendation.action}
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-500" />
                  <p className="text-white font-medium">{data.globalRecommendation.target}</p>
                </div>
                
                <p className="text-slate-300">{data.globalRecommendation.reason}</p>
              </Card>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-slate-500 text-sm">
            <p>Última actualización: {new Date(data.metadata.lastUpdated).toLocaleString('es-ES')}</p>
            <button
              onClick={fetchData}
              className="mt-2 text-cyan-400 hover:text-cyan-300 transition-colors inline-flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              Actualizar análisis
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DecisionMode;

