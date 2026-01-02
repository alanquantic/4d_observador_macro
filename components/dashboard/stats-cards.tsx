
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Target, Users, Sparkles, Zap, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatsCardsProps {
  stats: {
    activeProjects: number;
    totalRelationships: number;
    activeManifestations: number;
    avgEnergyLevel: number;
    synchronicities: number;
  };
  trends: {
    coherenceTrend: 'up' | 'down' | 'stable';
    energyTrend: 'up' | 'down' | 'stable';
  };
}

export default function StatsCards({ stats, trends }: StatsCardsProps) {
  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-400" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-400" />;
      case 'stable': return <Minus className="h-4 w-4 text-yellow-400" />;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return 'text-green-400';
      case 'down': return 'text-red-400';
      case 'stable': return 'text-yellow-400';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* Active Projects */}
      <Card className="bg-slate-900/50 border-green-500/30 backdrop-blur-sm hover:border-green-400/50 transition-colors">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium">Proyectos Activos</p>
              <p className="text-3xl font-bold text-white">{stats?.activeProjects || 0}</p>
            </div>
            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
              <Target className="h-6 w-6 text-green-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            {getTrendIcon(trends?.coherenceTrend)}
            <span className={`text-sm ${getTrendColor(trends?.coherenceTrend)}`}>
              {trends?.coherenceTrend === 'up' ? 'Aumentando' :
               trends?.coherenceTrend === 'down' ? 'Disminuyendo' : 'Estable'}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Total Relationships */}
      <Card className="bg-slate-900/50 border-blue-500/30 backdrop-blur-sm hover:border-blue-400/50 transition-colors">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium">Relaciones</p>
              <p className="text-3xl font-bold text-white">{stats?.totalRelationships || 0}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-400" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-slate-400">Red de conexiones activa</p>
          </div>
        </CardContent>
      </Card>

      {/* Active Manifestations */}
      <Card className="bg-slate-900/50 border-yellow-500/30 backdrop-blur-sm hover:border-yellow-400/50 transition-colors">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium">Manifestaciones</p>
              <p className="text-3xl font-bold text-white">{stats?.activeManifestations || 0}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-yellow-400" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-slate-400">En proceso de materialización</p>
          </div>
        </CardContent>
      </Card>

      {/* Average Energy Level */}
      <Card className="bg-slate-900/50 border-purple-500/30 backdrop-blur-sm hover:border-purple-400/50 transition-colors">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium">Energía Promedio</p>
              <p className="text-3xl font-bold text-white">{(stats?.avgEnergyLevel || 0).toFixed(1)}</p>
            </div>
            <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
              <Zap className="h-6 w-6 text-purple-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            {getTrendIcon(trends?.energyTrend)}
            <span className={`text-sm ${getTrendColor(trends?.energyTrend)}`}>
              {trends?.energyTrend === 'up' ? 'Incrementando' :
               trends?.energyTrend === 'down' ? 'Decreciendo' : 'Constante'}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Synchronicities */}
      <Card className="bg-slate-900/50 border-cyan-500/30 backdrop-blur-sm hover:border-cyan-400/50 transition-colors">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium">Sincronicidades</p>
              <p className="text-3xl font-bold text-white">{stats?.synchronicities || 0}</p>
            </div>
            <div className="w-12 h-12 bg-cyan-500/20 rounded-full flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-cyan-400" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-slate-400">Señales de alineación 4D</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
