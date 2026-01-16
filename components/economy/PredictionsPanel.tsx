'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Brain, TrendingUp, TrendingDown, AlertTriangle, Lightbulb, Target, Loader2, RefreshCw, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';

// ═══════════════════════════════════════════════════════════════════════════
// Panel de Predicciones IA
// Usa Gemini para predecir tendencias de ingresos
// ═══════════════════════════════════════════════════════════════════════════

interface PredictionsData {
  weeklyForecast: number;
  monthlyForecast: number;
  trend: 'growing' | 'declining' | 'stable' | 'insufficient_data';
  confidence: number;
  recommendations: string[];
  insights: string[];
  risks: string[];
}

interface PredictionsPanelProps {
  className?: string;
}

export function PredictionsPanel({ className }: PredictionsPanelProps) {
  const [data, setData] = useState<PredictionsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPredictions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/dashboard/predictions');
      if (response.ok) {
        const result = await response.json();
        setData(result.predictions);
      } else {
        const err = await response.json();
        setError(err.error || 'Error al cargar predicciones');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPredictions();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'growing': return <TrendingUp className="h-5 w-5 text-green-400" />;
      case 'declining': return <TrendingDown className="h-5 w-5 text-red-400" />;
      default: return <Minus className="h-5 w-5 text-slate-400" />;
    }
  };

  const getTrendLabel = (trend: string) => {
    switch (trend) {
      case 'growing': return { label: 'Creciendo', color: 'text-green-400', bg: 'bg-green-500/20' };
      case 'declining': return { label: 'Declinando', color: 'text-red-400', bg: 'bg-red-500/20' };
      case 'insufficient_data': return { label: 'Datos insuficientes', color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
      default: return { label: 'Estable', color: 'text-slate-400', bg: 'bg-slate-500/20' };
    }
  };

  if (loading) {
    return (
      <Card className={`bg-slate-900/70 border-purple-500/30 ${className}`}>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <Brain className="h-10 w-10 animate-pulse text-purple-400 mx-auto mb-3" />
            <p className="text-purple-300 text-sm">Analizando datos con IA...</p>
            <p className="text-slate-500 text-xs mt-1">Esto puede tomar unos segundos</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`bg-slate-900/70 border-red-500/30 ${className}`}>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="h-10 w-10 text-red-400 mx-auto mb-3" />
            <p className="text-red-300 text-sm mb-3">{error}</p>
            <Button onClick={fetchPredictions} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Reintentar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const trendInfo = getTrendLabel(data.trend);

  return (
    <Card className={`bg-gradient-to-br from-slate-900/90 to-purple-900/30 border-purple-500/30 ${className}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-400" />
            Predicciones IA
          </CardTitle>
          <Button onClick={fetchPredictions} variant="ghost" size="sm" className="text-slate-400 hover:text-white">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Forecasts */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <Target className="h-4 w-4 text-cyan-400" />
              <span className="text-xs text-slate-400">Próxima Semana</span>
            </div>
            <p className="text-2xl font-bold text-cyan-400">
              {formatCurrency(data.weeklyForecast)}
            </p>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <Target className="h-4 w-4 text-green-400" />
              <span className="text-xs text-slate-400">Próximo Mes</span>
            </div>
            <p className="text-2xl font-bold text-green-400">
              {formatCurrency(data.monthlyForecast)}
            </p>
          </div>
        </div>

        {/* Trend & Confidence */}
        <div className="flex items-center justify-between bg-slate-800/30 rounded-lg p-3">
          <div className="flex items-center gap-3">
            {getTrendIcon(data.trend)}
            <div>
              <p className={`text-sm font-medium ${trendInfo.color}`}>
                Tendencia: {trendInfo.label}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400">Confianza</p>
            <div className="flex items-center gap-2">
              <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all"
                  style={{ 
                    width: `${data.confidence}%`,
                    backgroundColor: data.confidence > 70 ? '#10B981' : 
                                    data.confidence > 40 ? '#F59E0B' : '#EF4444'
                  }}
                />
              </div>
              <span className="text-sm font-mono text-white">{data.confidence}%</span>
            </div>
          </div>
        </div>

        {/* Insights */}
        {data.insights.length > 0 && (
          <div>
            <p className="text-xs text-slate-400 mb-2 flex items-center gap-1">
              <Lightbulb className="h-3 w-3" />
              INSIGHTS
            </p>
            <div className="space-y-1">
              {data.insights.map((insight, i) => (
                <p key={i} className="text-sm text-slate-300 pl-3 border-l-2 border-purple-500/50">
                  {insight}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {data.recommendations.length > 0 && (
          <div>
            <p className="text-xs text-slate-400 mb-2 flex items-center gap-1">
              <Target className="h-3 w-3" />
              RECOMENDACIONES
            </p>
            <div className="space-y-2">
              {data.recommendations.map((rec, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-cyan-400 mt-0.5">→</span>
                  <p className="text-slate-300">{rec}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Risks */}
        {data.risks && data.risks.length > 0 && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
            <p className="text-xs text-red-400 mb-2 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              RIESGOS POTENCIALES
            </p>
            <div className="space-y-1">
              {data.risks.map((risk, i) => (
                <p key={i} className="text-sm text-red-300/80">{risk}</p>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
