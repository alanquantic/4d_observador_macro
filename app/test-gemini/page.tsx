import GeminiTest from '@/components/gemini/GeminiTest';

export default function TestGeminiPage() {
  return (
    <div className="container mx-auto py-10 px-4">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2">Google Gemini AI</h1>
        <p className="text-muted-foreground">
          Prueba la integración de Google Gemini AI en Observador 4D
        </p>
      </div>
      
      <GeminiTest />
      
      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>Powered by Google Gemini 2.5 Flash</p>
      </div>
    </div>
  );
}
