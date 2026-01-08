/**
 * API de Análisis de Coherencia con Gemini - OBSERVADOR4D
 * 
 * Analiza texto del usuario y devuelve métricas de coherencia
 * para la Geometría de Wolcoff.
 */

import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

interface AnalysisResult {
  coherence: number;
  energy: number;
  diagnosis: string;
  recommendation: string;
  emotionalState: 'flow' | 'expansion' | 'stable' | 'friction' | 'saturation' | 'collapse';
}

export async function POST(request: NextRequest) {
  try {
    // ⚠️ SEGURIDAD: Requiere autenticación para proteger recursos de Gemini API
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { 
          error: 'Autenticación requerida',
          message: 'Inicia sesión para usar el análisis con IA',
          requiresAuth: true 
        },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;

    const { text, context, nodeType } = await request.json();

    if (!text || text.trim().length < 10) {
      return NextResponse.json(
        { error: 'El texto debe tener al menos 10 caracteres' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GOOGLE_AI_API_KEY;
    
    if (!apiKey) {
      console.error('GOOGLE_AI_API_KEY no está configurada');
      return NextResponse.json(
        { error: 'Configuración de API Key faltante' },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenAI({ apiKey });

    // Prompt optimizado para análisis de coherencia
    const systemPrompt = `Eres un analista experto en gestión de proyectos, bienestar personal y dinámica de sistemas.
Tu tarea es analizar el texto del usuario y evaluar su estado actual de coherencia y energía.

CONTEXTO: ${context || 'Situación general'}
TIPO DE ELEMENTO: ${nodeType || 'No especificado'}

CRITERIOS DE EVALUACIÓN:

1. COHERENCE (0.0 a 1.0) - Nivel de alineación y flujo:
   - 1.0 = Flujo total, claridad absoluta, sin fricción
   - 0.8 = Muy alineado, pequeñas resistencias manejables
   - 0.6 = Equilibrado pero con áreas de mejora
   - 0.4 = Fricción notable, resistencia activa
   - 0.2 = Alta resistencia, bloqueos significativos
   - 0.0 = Colapso total, parálisis

2. ENERGY (0.0 a 1.0) - Nivel de vitalidad y recursos:
   - 1.0 = Energía máxima, abundantes recursos
   - 0.8 = Alta energía, bien posicionado
   - 0.6 = Energía moderada, sostenible
   - 0.4 = Energía baja, necesita recarga
   - 0.2 = Muy baja energía, agotamiento
   - 0.0 = Sin energía, vacío total

3. EMOTIONAL_STATE (una de estas opciones):
   - "flow" = Estado óptimo de fluidez
   - "expansion" = Crecimiento activo
   - "stable" = Mantenimiento equilibrado
   - "friction" = Resistencia y obstáculos
   - "saturation" = Sobrecarga
   - "collapse" = Crisis o colapso

INSTRUCCIONES:
- Analiza el TONO emocional del texto
- Identifica palabras clave de ESFUERZO vs FLUJO
- Detecta señales de RESISTENCIA o BLOQUEO
- Evalúa el nivel de CLARIDAD en la comunicación
- Considera el contexto empresarial/personal

Responde ÚNICAMENTE con este JSON válido (sin markdown, sin explicaciones):
{
  "coherence": número entre 0.0 y 1.0,
  "energy": número entre 0.0 y 1.0,
  "diagnosis": "frase corta de máximo 15 palabras describiendo el estado actual",
  "recommendation": "acción concreta de máximo 20 palabras",
  "emotionalState": "flow" | "expansion" | "stable" | "friction" | "saturation" | "collapse"
}`;

    const userPrompt = `Analiza el siguiente texto y devuelve el JSON de evaluación:

"${text}"`;

    const result = await genAI.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: `${systemPrompt}\n\n${userPrompt}`
    });

    // Parsear respuesta
    let responseText = result.text || '';
    
    // Limpiar posibles artefactos de markdown
    responseText = responseText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .replace(/^\s+|\s+$/g, '');

    let analysisResult: AnalysisResult;
    
    try {
      analysisResult = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Error parsing AI response:', responseText);
      // Fallback con valores por defecto
      analysisResult = {
        coherence: 0.5,
        energy: 0.5,
        diagnosis: 'No se pudo analizar el texto correctamente',
        recommendation: 'Intenta reformular tu descripción con más detalle',
        emotionalState: 'stable'
      };
    }

    // Validar y normalizar valores
    analysisResult.coherence = Math.max(0, Math.min(1, analysisResult.coherence));
    analysisResult.energy = Math.max(0, Math.min(1, analysisResult.energy));

    return NextResponse.json({
      success: true,
      analysis: analysisResult,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error en /api/gemini/analyze-coherence:', error);
    
    return NextResponse.json(
      {
        error: 'Error al analizar coherencia',
        details: error?.message || 'Error desconocido'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'API de Análisis de Coherencia - OBSERVADOR4D',
    description: 'Analiza texto y devuelve métricas de coherencia para la Geometría de Wolcoff',
    usage: {
      method: 'POST',
      body: {
        text: 'string (requerido) - Texto a analizar (mín. 10 caracteres)',
        context: 'string (opcional) - Contexto adicional',
        nodeType: 'string (opcional) - Tipo de nodo: project, relationship, intention, manifestation'
      }
    },
    response: {
      coherence: 'number (0.0 - 1.0)',
      energy: 'number (0.0 - 1.0)',
      diagnosis: 'string',
      recommendation: 'string',
      emotionalState: 'flow | expansion | stable | friction | saturation | collapse'
    }
  });
}

