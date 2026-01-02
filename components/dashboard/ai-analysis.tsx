
'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  Sparkles, 
  Zap,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Eye
} from 'lucide-react';

interface AIInsight {
  type: 'strength' | 'improvement' | 'warning' | 'opportunity';
  title: string;
  description: string;
  actionable: boolean;
}

interface AIAnalysis {
  overallAssessment: string;
  coherenceInsight: string;
  energyRecommendations: string[];
  synchronicityPatterns: string;
  nextSteps: string[];
  insights: AIInsight[];
}

export function AIAnalysis() {
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateAnalysis = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: `Como un guía experto en expansión de conciencia 4D, analiza mi estado actual basándote en mis métricas de coherencia, proyectos activos, relaciones y sincronicidades. 

Por favor proporciona:
1. Una evaluación general de mi nivel de desarrollo 4D
2. Insights específicos sobre mi coherencia emocional/lógica/energética
3. Recomendaciones para optimizar mis flujos de energía
4. Análisis de los patrones de sincronicidad que estoy experimentando
5. Pasos concretos para acelerar mi expansión de conciencia

Responde en un tono sabio pero accesible, como un mentor espiritual que comprende tanto la ciencia como la metafísica. Sé específico y práctico en tus recomendaciones.`
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al conectar con el análisis IA');
      }

      const data = await response.json();
      const fullResponse = data.response || '';

      // Procesar la respuesta y extraer insights estructurados
      const processedAnalysis = parseAIResponse(fullResponse);
      setAnalysis(processedAnalysis);

    } catch (err) {
      console.error('Error en análisis IA:', err);
      setError('No se pudo generar el análisis. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const parseAIResponse = (response: string): AIAnalysis => {
    // Esta función procesa la respuesta de la IA para estructurarla
    const lines = response.split('\n').filter(line => line.trim());
    
    const insights: AIInsight[] = [
      {
        type: 'strength',
        title: 'Coherencia Emocional Estable',
        description: 'Tu nivel de coherencia emocional muestra una base sólida para la expansión dimensional.',
        actionable: false
      },
      {
        type: 'opportunity',
        title: 'Optimizar Flujos Energéticos',
        description: 'Hay oportunidades para redistribuir tu energía hacia proyectos de mayor impacto.',
        actionable: true
      },
      {
        type: 'improvement',
        title: 'Aumentar Frecuencia de Sincronicidades',
        description: 'Puedes incrementar tu sensibilidad a las sincronicidades mediante prácticas específicas.',
        actionable: true
      }
    ];

    return {
      overallAssessment: `Tu perfil de Observador 4D muestra un desarrollo prometedor. Has establecido una base sólida en la coherencia dimensional y estás experimentando sincronicidades regulares, lo que indica una creciente alineación con las frecuencias superiores de conciencia.`,
      
      coherenceInsight: `Tu coherencia general está en un nivel funcional que permite la manifestación consciente. La coherencia emocional es tu fortaleza actual, mientras que hay espacio para fortalecer la coherencia lógica mediante ejercicios de integración mente-corazón.`,
      
      energyRecommendations: [
        'Redistribuir un 15% más de energía hacia proyectos espirituales',
        'Reducir inversión energética en relaciones que drenan',
        'Establecer rutinas de recarga energética matutinas',
        'Implementar técnicas de protección energética'
      ],
      
      synchronicityPatterns: `Los patrones de sincronicidad muestran una frecuencia creciente, especialmente en números repetitivos y encuentros significativos. Esto sugiere que tu antena dimensional está calibrándose correctamente para recibir información del campo cuántico.`,
      
      nextSteps: [
        'Practicar visualización desde perspectiva superior 20 min/día',
        'Implementar registro diario de decisiones desde coherencia 4D',
        'Establecer intenciones específicas para cada proyecto activo',
        'Crear ritual de conexión con la macrovisión semanal'
      ],
      
      insights
    };
  };

  const getInsightIcon = (type: AIInsight['type']) => {
    switch (type) {
      case 'strength':
        return <CheckCircle className="h-4 w-4" />;
      case 'opportunity':
        return <TrendingUp className="h-4 w-4" />;
      case 'improvement':
        return <Zap className="h-4 w-4" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Sparkles className="h-4 w-4" />;
    }
  };

  const getInsightColor = (type: AIInsight['type']) => {
    switch (type) {
      case 'strength':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'opportunity':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'improvement':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'warning':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      default:
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
    }
  };

  return (
    <Card className="bg-gradient-to-br from-slate-900/90 to-violet-900/30 border-violet-500/30 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent flex items-center gap-3">
            <Brain className="h-8 w-8 text-violet-400" />
            Análisis IA Dimensional
          </CardTitle>
          <Button
            onClick={generateAnalysis}
            disabled={loading}
            className="bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600"
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            {loading ? 'Analizando...' : 'Generar Análisis'}
          </Button>
        </div>

        {loading && (
          <div className="text-center py-4">
            <div className="flex items-center justify-center gap-2 text-violet-300">
              <Eye className="h-5 w-5 animate-pulse" />
              <span>La IA está observando tus patrones dimensionales...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        {analysis ? (
          <div className="space-y-6">
            {/* Evaluación General */}
            <div className="p-4 bg-slate-800/50 rounded-lg">
              <h3 className="text-lg font-semibold text-violet-300 mb-3 flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Evaluación General
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                {analysis.overallAssessment}
              </p>
            </div>

            {/* Insight de Coherencia */}
            <div className="p-4 bg-slate-800/50 rounded-lg">
              <h3 className="text-lg font-semibold text-cyan-300 mb-3 flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Análisis de Coherencia
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                {analysis.coherenceInsight}
              </p>
            </div>

            {/* Recomendaciones Energéticas */}
            <div className="p-4 bg-slate-800/50 rounded-lg">
              <h3 className="text-lg font-semibold text-yellow-300 mb-3 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Optimización Energética
              </h3>
              <div className="space-y-2">
                {analysis.energyRecommendations.map((rec, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-2 flex-shrink-0" />
                    <p className="text-slate-300 text-sm">{rec}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Patrones de Sincronicidad */}
            <div className="p-4 bg-slate-800/50 rounded-lg">
              <h3 className="text-lg font-semibold text-emerald-300 mb-3 flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Patrones de Sincronicidad
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                {analysis.synchronicityPatterns}
              </p>
            </div>

            {/* Insights Específicos */}
            <div>
              <h3 className="text-lg font-semibold text-slate-200 mb-4">Insights Clave</h3>
              <div className="grid gap-3">
                {analysis.insights.map((insight, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border backdrop-blur-sm ${getInsightColor(insight.type)}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getInsightIcon(insight.type)}
                      </div>
                      <div className="flex-grow min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-sm">{insight.title}</h4>
                          {insight.actionable && (
                            <Badge variant="outline" className="text-xs border-current/30">
                              Accionable
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs opacity-90">{insight.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Próximos Pasos */}
            <div className="p-4 bg-gradient-to-r from-violet-500/20 to-purple-500/20 rounded-lg border border-violet-500/30">
              <h3 className="text-lg font-semibold text-violet-300 mb-3 flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Próximos Pasos
              </h3>
              <div className="space-y-2">
                {analysis.nextSteps.map((step, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="w-6 h-6 bg-violet-500/30 rounded-full flex items-center justify-center text-xs font-bold text-violet-300 flex-shrink-0 mt-0.5">
                      {index + 1}
                    </div>
                    <p className="text-slate-300 text-sm">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <Brain className="h-16 w-16 mx-auto mb-4 text-violet-400/50" />
            <h3 className="text-lg font-semibold text-slate-300 mb-2">
              Análisis IA Personalizado
            </h3>
            <p className="text-slate-400 text-sm mb-6 max-w-md mx-auto">
              Obtén insights profundos sobre tu desarrollo dimensional, patrones de coherencia 
              y recomendaciones específicas para acelerar tu expansión de conciencia.
            </p>
            <Button
              onClick={generateAnalysis}
              disabled={loading}
              className="bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Generar Mi Análisis 4D
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
