
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Sparkles, Clock, Target, Plus } from 'lucide-react';

interface ManifestationTrackerProps {
  manifestations: any[];
}

export default function ManifestationTracker({ manifestations }: ManifestationTrackerProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'intention': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'action': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'manifesting': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'completed': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'cancelled': return 'bg-red-500/20 text-red-300 border-red-500/30';
      default: return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'intention': return 'Intención';
      case 'action': return 'Acción';
      case 'manifesting': return 'Manifestando';
      case 'completed': return 'Manifestado';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'wealth': return '💰';
      case 'health': return '🌿';
      case 'relationships': return '💕';
      case 'career': return '🚀';
      case 'spiritual': return '✨';
      case 'creative': return '🎨';
      default: return '🎯';
    }
  };

  const getTimeframeLabel = (timeframe: string) => {
    switch (timeframe) {
      case 'short_term': return 'Corto plazo';
      case 'medium_term': return 'Mediano plazo';
      case 'long_term': return 'Largo plazo';
      default: return timeframe;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="bg-gradient-to-br from-purple-900/30 to-yellow-900/30 border-purple-500/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-400" />
            Seguimiento de Manifestaciones
          </CardTitle>
          <CardDescription className="text-slate-400">
            Programa y rastrea tus intenciones desde la perspectiva 4D
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <div className="text-2xl font-bold text-blue-400 mb-1">
                {manifestations?.filter(m => m.status === 'intention').length || 0}
              </div>
              <div className="text-sm text-slate-400">Intenciones</div>
            </div>
            <div className="text-center p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
              <div className="text-2xl font-bold text-purple-400 mb-1">
                {manifestations?.filter(m => ['action', 'manifesting'].includes(m.status)).length || 0}
              </div>
              <div className="text-sm text-slate-400">En Proceso</div>
            </div>
            <div className="text-center p-4 bg-green-500/10 rounded-lg border border-green-500/20">
              <div className="text-2xl font-bold text-green-400 mb-1">
                {manifestations?.filter(m => m.status === 'completed').length || 0}
              </div>
              <div className="text-sm text-slate-400">Manifestadas</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Manifestations List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {manifestations && manifestations.length > 0 ? (
          manifestations.map((manifest, index) => (
            <Card key={index} className="bg-slate-900/50 border-slate-700 backdrop-blur-sm hover:border-slate-600 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getCategoryIcon(manifest.category)}</span>
                    <div>
                      <h4 className="text-white font-semibold mb-1">{manifest.title}</h4>
                      <p className="text-slate-400 text-sm">{manifest.description}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs border ${getStatusColor(manifest.status)}`}>
                    {getStatusLabel(manifest.status)}
                  </span>
                </div>

                <div className="space-y-4">
                  {/* Progress Bar */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-400">Progreso de Manifestación</span>
                      <span className="text-sm text-white font-semibold">
                        {Math.round(manifest.manifestationStage || 0)}%
                      </span>
                    </div>
                    <Progress value={manifest.manifestationStage || 0} className="h-3" />
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-3 gap-4 text-xs">
                    <div className="text-center p-2 bg-slate-800/30 rounded">
                      <div className="text-slate-400 mb-1">Timeframe</div>
                      <div className="text-cyan-300 font-semibold">
                        {getTimeframeLabel(manifest.timeframe)}
                      </div>
                    </div>
                    <div className="text-center p-2 bg-slate-800/30 rounded">
                      <div className="text-slate-400 mb-1">Energía Req.</div>
                      <div className="text-purple-300 font-semibold">
                        {manifest.energyRequired}/10
                      </div>
                    </div>
                    <div className="text-center p-2 bg-slate-800/30 rounded">
                      <div className="text-slate-400 mb-1">Impacto</div>
                      <div className="text-yellow-300 font-semibold">
                        {manifest.impactLevel}/10
                      </div>
                    </div>
                  </div>

                  {/* Specific Goals */}
                  {manifest.specificGoals && Array.isArray(manifest.specificGoals) && manifest.specificGoals.length > 0 && (
                    <div className="p-3 bg-slate-800/20 rounded-lg border border-slate-700/50">
                      <p className="text-xs text-slate-400 mb-2 flex items-center gap-2">
                        <Target className="h-3 w-3" />
                        Objetivos Específicos
                      </p>
                      <ul className="space-y-1">
                        {manifest.specificGoals.slice(0, 3).map((goal: string, goalIndex: number) => (
                          <li key={goalIndex} className="text-xs text-slate-300 flex items-start gap-2">
                            <span className="text-yellow-400 mt-0.5">✓</span>
                            <span className="flex-1">{goal}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Action Steps */}
                  {manifest.actionSteps && Array.isArray(manifest.actionSteps) && manifest.actionSteps.length > 0 && (
                    <div className="p-3 bg-slate-800/20 rounded-lg border border-slate-700/50">
                      <p className="text-xs text-slate-400 mb-2">Próximos Pasos de Acción</p>
                      <ul className="space-y-1">
                        {manifest.actionSteps.slice(0, 2).map((step: string, stepIndex: number) => (
                          <li key={stepIndex} className="text-xs text-slate-300 flex items-start gap-2">
                            <span className="text-cyan-400 mt-0.5">→</span>
                            <span className="flex-1">{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Timeline */}
                  {manifest.intendedBy && (
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Clock className="h-3 w-3" />
                      <span>
                        Meta de manifestación: {new Date(manifest.intendedBy).toLocaleDateString('es-ES', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="col-span-full bg-slate-900/50 border-slate-700 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <Sparkles className="h-16 w-16 text-slate-600 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-slate-400 mb-4">Sin manifestaciones activas</h3>
              <p className="text-slate-500 text-sm mb-6 max-w-md mx-auto">
                Crea tu primera manifestación 4D. Programa tus intenciones desde la perspectiva dimensional superior 
                y observa como se materializan en tu realidad.
              </p>
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500/20 to-yellow-500/20 text-purple-300 rounded-lg border border-purple-500/30 hover:border-purple-500/50 transition-colors cursor-pointer">
                <Plus className="h-4 w-4" />
                Nueva Manifestación
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
