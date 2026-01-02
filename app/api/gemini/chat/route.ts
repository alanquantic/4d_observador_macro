import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { prompt, model = 'gemini-2.5-flash' } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'El campo "prompt" es requerido' },
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
    
    const result = await genAI.models.generateContent({
      model,
      contents: prompt
    });

    return NextResponse.json({
      success: true,
      response: result.text,
      model: model
    });

  } catch (error: any) {
    console.error('Error en /api/gemini/chat:', error);
    
    return NextResponse.json(
      {
        error: 'Error al procesar la solicitud',
        details: error?.message || 'Error desconocido'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Endpoint de Google Gemini AI',
    usage: 'Envía una solicitud POST con { "prompt": "tu pregunta aquí" }',
    models: [
      'gemini-2.5-flash',
      'gemini-2.5-pro-preview-06-05',
      'gemini-2.5-flash-preview-05-20'
    ]
  });
}
