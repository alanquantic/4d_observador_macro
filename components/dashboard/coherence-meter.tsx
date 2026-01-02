
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Brain, Heart, Zap, Target } from 'lucide-react';

interface CoherenceMeterProps {
  coherence: {
    overall: number;
    emotional: number;
    logical: number;
    energetic: number;
  };
}

export default function CoherenceMeter({ coherence }: CoherenceMeterProps) {
  const getCoherenceColor = (value: number) => {
    if (value >= 80) return 'text-green-400';
    if (value >= 60) return 'text-yellow-400';
    if (value >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getProgressColor = (value: number) => {
    if (value >= 80) return 'bg-green-500';
    if (value >= 60) return 'bg-yellow-500';
    if (value >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <Card className="bg-slate-900/50 border-purple-500/30 backdrop-blur-sm h-fit">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-400" />
          Medidor de Coherencia 4D
        </CardTitle>
        <CardDescription className="text-slate-400">
          Tu nivel de alineación dimensional en tiempo real
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Coherence */}
        <div className="text-center p-6 bg-gradient-to-br from-purple-900/30 to-cyan-900/30 rounded-lg border border-purple-500/20">
          <div className="relative w-32 h-32 mx-auto mb-4">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="rgb(100 116 139 / 0.2)"
                strokeWidth="4"
              />
              {/* Progress circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 45}`}
                strokeDashoffset={`${2 * Math.PI * 45 * (1 - (coherence?.overall || 0) / 100)}`}
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-3xl font-bold ${getCoherenceColor(coherence?.overall || 0)}`}>
                {Math.round(coherence?.overall || 0)}%
              </span>
              <span className="text-xs text-slate-400 uppercase tracking-wide">Coherencia</span>
            </div>
          </div>
          
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-white">Sincronización Dimensional</h3>
            <p className="text-sm text-slate-400">
              {(coherence?.overall || 0) >= 80 ? 'Excelente alineación 4D' :
               (coherence?.overall || 0) >= 60 ? 'Buena coherencia dimensional' :
               (coherence?.overall || 0) >= 40 ? 'Coherencia en desarrollo' :
               'Requiere mayor alineación'}
            </p>
          </div>
        </div>

        {/* Coherence Components */}
        <div className="space-y-4">
          {/* Emotional Coherence */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-pink-400" />
                <span className="text-white font-medium">Emocional</span>
              </div>
              <span className={`font-semibold ${getCoherenceColor(coherence?.emotional || 0)}`}>
                {Math.round(coherence?.emotional || 0)}%
              </span>
            </div>
            <div className="relative">
              <Progress value={coherence?.emotional || 0} className="h-2" />
              <div 
                className={`absolute top-0 left-0 h-2 rounded-full transition-all duration-1000 ${getProgressColor(coherence?.emotional || 0)}`}
                style={{ width: `${coherence?.emotional || 0}%` }}
              />
            </div>
          </div>

          {/* Logical Coherence */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-400" />
                <span className="text-white font-medium">Lógica</span>
              </div>
              <span className={`font-semibold ${getCoherenceColor(coherence?.logical || 0)}`}>
                {Math.round(coherence?.logical || 0)}%
              </span>
            </div>
            <div className="relative">
              <Progress value={coherence?.logical || 0} className="h-2" />
              <div 
                className={`absolute top-0 left-0 h-2 rounded-full transition-all duration-1000 ${getProgressColor(coherence?.logical || 0)}`}
                style={{ width: `${coherence?.logical || 0}%` }}
              />
            </div>
          </div>

          {/* Energetic Coherence */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-400" />
                <span className="text-white font-medium">Energética</span>
              </div>
              <span className={`font-semibold ${getCoherenceColor(coherence?.energetic || 0)}`}>
                {Math.round(coherence?.energetic || 0)}%
              </span>
            </div>
            <div className="relative">
              <Progress value={coherence?.energetic || 0} className="h-2" />
              <div 
                className={`absolute top-0 left-0 h-2 rounded-full transition-all duration-1000 ${getProgressColor(coherence?.energetic || 0)}`}
                style={{ width: `${coherence?.energetic || 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700">
          <h4 className="text-sm font-semibold text-purple-300 mb-2">Recomendación 4D</h4>
          <p className="text-xs text-slate-400">
            {(coherence?.overall || 0) >= 80 
              ? 'Mantén tu práctica de observación dimensional. Considera expandir a nuevos proyectos.'
              : (coherence?.overall || 0) >= 60
              ? 'Continúa desarrollando tu perspectiva 4D. Enfócate en la coherencia más baja.'
              : 'Dedica más tiempo a los ejercicios de elevación y observación desde arriba.'
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
