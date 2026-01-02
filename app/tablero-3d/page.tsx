
'use client';

import { Suspense, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Maximize2, Info, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';

const Scene3D = dynamic(() => import('@/components/tablero3d/Scene3D').then((mod) => mod.default), {
  ssr: false,
  loading: () => (
    <div className="h-screen w-full bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-900 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 border-4 border-t-cyan-400 border-r-purple-500 border-b-pink-500 border-l-cyan-400 rounded-full animate-spin mx-auto"></div>
        <p className="text-cyan-400 font-light text-lg">Inicializando Tablero 4D...</p>
        <p className="text-slate-400 text-sm">Cargando motor 3D y realidad cuántica</p>
      </div>
    </div>
  ),
});

export default function Tablero3DPage() {
  const router = useRouter();

  const handleZoomIn = useCallback(() => {
    window.dispatchEvent(new CustomEvent('scene3d-zoom', { detail: { action: 'in' } }));
  }, []);

  const handleZoomOut = useCallback(() => {
    window.dispatchEvent(new CustomEvent('scene3d-zoom', { detail: { action: 'out' } }));
  }, []);

  const handleResetView = useCallback(() => {
    window.dispatchEvent(new CustomEvent('scene3d-zoom', { detail: { action: 'reset' } }));
  }, []);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black">
      {/* Header con controles */}
      <div className="absolute top-0 left-0 right-0 z-50 p-4 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
        <div className="flex items-center justify-between max-w-7xl mx-auto pointer-events-auto">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard')}
            className="bg-black/50 backdrop-blur-sm border border-cyan-500/30 hover:bg-cyan-500/20 text-cyan-400"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al Dashboard
          </Button>

          <div className="flex items-center gap-3">
            <Card className="bg-black/50 backdrop-blur-sm border-purple-500/30 px-4 py-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-slate-300 font-light">Vista 4D Activa</span>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Controles de Zoom - Lado Derecho */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleZoomIn}
          className="w-12 h-12 bg-black/70 backdrop-blur-sm border-2 border-cyan-500/50 hover:bg-cyan-500/30 hover:border-cyan-400 text-cyan-400 rounded-xl shadow-lg shadow-cyan-500/20 transition-all"
        >
          <ZoomIn className="h-6 w-6" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={handleZoomOut}
          className="w-12 h-12 bg-black/70 backdrop-blur-sm border-2 border-purple-500/50 hover:bg-purple-500/30 hover:border-purple-400 text-purple-400 rounded-xl shadow-lg shadow-purple-500/20 transition-all"
        >
          <ZoomOut className="h-6 w-6" />
        </Button>

        <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-500/50 to-transparent my-1" />
        
        <Button
          variant="ghost"
          size="icon"
          onClick={handleResetView}
          className="w-12 h-12 bg-black/70 backdrop-blur-sm border-2 border-pink-500/50 hover:bg-pink-500/30 hover:border-pink-400 text-pink-400 rounded-xl shadow-lg shadow-pink-500/20 transition-all"
        >
          <RotateCcw className="h-5 w-5" />
        </Button>
      </div>

      {/* Instrucciones Compactas */}
      <div className="absolute bottom-6 left-6 z-50 max-w-sm pointer-events-none">
        <Card className="bg-black/85 backdrop-blur-md border border-cyan-500/40 p-4 pointer-events-auto shadow-xl">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Info className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-cyan-300 font-semibold text-sm">Controles 3D</p>
              <p className="text-slate-500 text-xs">Tablero Dimensional</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="text-cyan-400">🔄</span>
              <span>Arrastrar = Rotar</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="text-purple-400">🔍</span>
              <span>Scroll = Zoom</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="text-pink-400">👆</span>
              <span>Clic = Info nodo</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="text-green-400">↔️</span>
              <span>Clic Der. = Pan</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Escena 3D */}
      <Suspense fallback={<div className="h-screen w-full bg-black" />}>
        <Scene3D />
      </Suspense>
    </div>
  );
}
