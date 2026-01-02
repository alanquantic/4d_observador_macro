
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, TrendingUp } from 'lucide-react';

interface RecentActivityProps {
  entries: any[];
}

export default function RecentActivity({ entries }: RecentActivityProps) {
  const getEmotionColor = (emotion: number) => {
    if (emotion >= 8) return 'text-green-400';
    if (emotion >= 6) return 'text-yellow-400';
    if (emotion >= 4) return 'text-orange-400';
    return 'text-red-400';
  };

  const getEnergyColor = (energy: number) => {
    if (energy >= 8) return 'text-purple-400';
    if (energy >= 6) return 'text-blue-400';
    if (energy >= 4) return 'text-cyan-400';
    return 'text-gray-400';
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString('es-ES', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Calendar className="h-5 w-5 text-slate-400" />
          Actividad Reciente
        </CardTitle>
        <CardDescription className="text-slate-400">
          Tus últimos registros dimensionales
        </CardDescription>
      </CardHeader>
      <CardContent>
        {entries && entries.length > 0 ? (
          <div className="space-y-4">
            {entries.slice(0, 5).map((entry, index) => (
              <div key={index} className="p-4 bg-slate-800/30 rounded-lg border border-slate-700">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-slate-400">
                    {formatDate(entry.date)}
                  </span>
                  <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-300 rounded">
                    {Math.round(entry.coherenceLevel || 0)}% coherencia
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">Estado Emocional</span>
                      <span className={`text-sm font-semibold ${getEmotionColor(entry.emotionalState)}`}>
                        {entry.emotionalState}/10
                      </span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-1.5">
                      <div 
                        className="bg-gradient-to-r from-red-500 to-green-500 h-1.5 rounded-full"
                        style={{ width: `${(entry.emotionalState / 10) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">Nivel de Energía</span>
                      <span className={`text-sm font-semibold ${getEnergyColor(entry.energyLevel)}`}>
                        {entry.energyLevel}/10
                      </span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-1.5">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-cyan-500 h-1.5 rounded-full"
                        style={{ width: `${(entry.energyLevel / 10) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                {entry.observations && (
                  <div className="mt-3 p-3 bg-slate-700/30 rounded-md">
                    <p className="text-sm text-slate-300">{entry.observations}</p>
                  </div>
                )}

                {entry.synchronicities && Array.isArray(entry.synchronicities) && entry.synchronicities.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs text-cyan-400 mb-2">Sincronicidades detectadas:</p>
                    <div className="space-y-1">
                      {entry.synchronicities.slice(0, 2).map((sync: any, syncIndex: number) => (
                        <div key={syncIndex} className="text-xs text-slate-400 bg-cyan-500/10 px-2 py-1 rounded">
                          {sync.title}: {sync.description}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {entry.alignmentScore && (
                  <div className="mt-3 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-400" />
                    <span className="text-xs text-slate-400">
                      Alineación: <span className="text-green-400 font-semibold">{Math.round(entry.alignmentScore)}%</span>
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Clock className="h-12 w-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-400 mb-2">Sin actividad reciente</h3>
            <p className="text-slate-500 text-sm">
              Comienza registrando tu primera entrada diaria para ver tu actividad aquí
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
