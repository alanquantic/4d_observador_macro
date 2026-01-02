import { GoogleGenAI } from '@google/genai';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function testGemini() {
  console.log('🚀 Iniciando prueba de Google Gemini AI...\n');

  const apiKey = process.env.GOOGLE_AI_API_KEY;
  
  if (!apiKey) {
    console.error('❌ Error: GOOGLE_AI_API_KEY no está configurada en .env');
    process.exit(1);
  }

  console.log('✅ API Key encontrada');
  console.log(`📝 API Key: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 5)}\n`);

  try {
    const genAI = new GoogleGenAI({ apiKey });
    
    console.log('📤 Enviando prompt de prueba: "Hola, ¿cómo estás? Responde en español brevemente."\n');

    const result = await genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Hola, ¿cómo estás? Responde en español brevemente.'
    });

    console.log('✅ ¡Conexión exitosa con Google Gemini AI!\n');
    console.log('📥 Respuesta recibida:');
    console.log('─'.repeat(50));
    console.log(result.text);
    console.log('─'.repeat(50));
    console.log('\n✨ Prueba completada exitosamente');

  } catch (error) {
    console.error('❌ Error al conectar con Google Gemini AI:');
    console.error(error);
    process.exit(1);
  }
}

testGemini();
