import { GoogleGenAI } from '@google/genai';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function listModels() {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    console.error('❌ Error: GOOGLE_AI_API_KEY no está configurada');
    process.exit(1);
  }

  try {
    const genAI = new GoogleGenAI({ apiKey });
    const models = await genAI.models.list();
    console.log('Modelos disponibles:');
    console.log(JSON.stringify(models, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

listModels();
