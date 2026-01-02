
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Target, Plus, Clock } from 'lucide-react';

interface ProjectsOverviewProps {
  projects: any[];
}

export default function ProjectsOverview({ projects }: ProjectsOverviewProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'paused': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'completed': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'cancelled': return 'bg-red-500/20 text-red-300 border-red-500/30';
      default: return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Activo';
      case 'paused': return 'Pausado';
      case 'completed': return 'Completado';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'spiritual': return 'text-purple-400';
      case 'professional': return 'text-blue-400';
      case 'personal': return 'text-green-400';
      case 'health': return 'text-red-400';
      case 'creative': return 'text-yellow-400';
      default: return 'text-slate-400';
    }
  };

  return (
    <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Target className="h-5 w-5 text-slate-400" />
          Proyectos Dimensionales
        </CardTitle>
        <CardDescription className="text-slate-400">
          Manifestaciones en progreso desde la perspectiva 4D
        </CardDescription>
      </CardHeader>
      <CardContent>
        {projects && projects.length > 0 ? (
          <div className="space-y-4">
            {projects.slice(0, 4).map((project, index) => (
              <div key={index} className="p-4 bg-slate-800/30 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="text-white font-semibold mb-1">{project.name}</h4>
                    <p className="text-slate-400 text-sm mb-2 line-clamp-2">
                      {project.description}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2 ml-4">
                    <span className={`px-2 py-1 rounded text-xs border ${getStatusColor(project.status)}`}>
                      {getStatusLabel(project.status)}
                    </span>
                    {project.category && (
                      <span className={`text-xs font-medium ${getCategoryColor(project.category)}`}>
                        {project.category}
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-slate-400">Progreso</span>
                      <span className="text-xs text-white font-semibold">
                        {Math.round(project.progress || 0)}%
                      </span>
                    </div>
                    <Progress value={project.progress || 0} className="h-2" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400">Energía Invertida:</span>
                      <div className="flex items-center gap-1 mt-1">
                        {[...Array(10)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-2 h-2 rounded-full ${
                              i < (project.energyInvested || 0) 
                                ? 'bg-purple-500' 
                                : 'bg-slate-700'
                            }`}
                          />
                        ))}
                        <span className="text-purple-300 ml-2 font-semibold">
                          {project.energyInvested || 0}/10
                        </span>
                      </div>
                    </div>

                    {project.impactLevel && (
                      <div>
                        <span className="text-slate-400">Impacto Esperado:</span>
                        <div className="flex items-center gap-1 mt-1">
                          {[...Array(10)].map((_, i) => (
                            <div
                              key={i}
                              className={`w-2 h-2 rounded-full ${
                                i < project.impactLevel 
                                  ? 'bg-cyan-500' 
                                  : 'bg-slate-700'
                              }`}
                            />
                          ))}
                          <span className="text-cyan-300 ml-2 font-semibold">
                            {project.impactLevel}/10
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {project.nextSteps && Array.isArray(project.nextSteps) && project.nextSteps.length > 0 && (
                    <div className="mt-3 p-2 bg-slate-700/30 rounded">
                      <p className="text-xs text-slate-400 mb-1">Próximos pasos:</p>
                      <ul className="text-xs text-slate-300 space-y-1">
                        {project.nextSteps.slice(0, 2).map((step: string, stepIndex: number) => (
                          <li key={stepIndex} className="flex items-start gap-2">
                            <span className="text-cyan-400 mt-0.5">•</span>
                            <span className="flex-1">{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {project.targetDate && (
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Clock className="h-3 w-3" />
                      <span>
                        Meta: {new Date(project.targetDate).toLocaleDateString('es-ES', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Target className="h-12 w-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-400 mb-2">Sin proyectos activos</h3>
            <p className="text-slate-500 text-sm mb-4">
              Crea tu primer proyecto dimensional para comenzar a manifestar desde el 4D
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 text-purple-300 rounded-lg border border-purple-500/30 hover:bg-purple-500/30 transition-colors cursor-pointer">
              <Plus className="h-4 w-4" />
              Nuevo Proyecto
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
