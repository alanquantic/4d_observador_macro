
'use client';

import { useEffect, useRef, useState } from 'react';
import * as BABYLON from '@babylonjs/core';
import { Node3D } from './Node3D';
import { Link3D } from './Link3D';
import { Grid3D } from './Grid3D';
import { Particles3D } from './Particles3D';
import { Card } from '@/components/ui/card';
import { X } from 'lucide-react';

interface NodeData {
  id: string;
  x: number;
  y: number;
  z: number;
  size: number;
  energy: number;
  label: string;
  color: string;
  type: string;
}

interface LinkData {
  source: string;
  target: string;
  strength: number;
}

function Scene3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<BABYLON.Engine | null>(null);
  const sceneRef = useRef<BABYLON.Scene | null>(null);
  const cameraRef = useRef<BABYLON.ArcRotateCamera | null>(null);
  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null);
  const [debugMode, setDebugMode] = useState(false);

  // Listen for zoom events from parent
  useEffect(() => {
    const handleZoomEvent = (event: CustomEvent<{ action: string }>) => {
      const camera = cameraRef.current;
      if (!camera) return;

      switch (event.detail.action) {
        case 'in':
          camera.radius = Math.max(camera.lowerRadiusLimit || 20, camera.radius - 5);
          break;
        case 'out':
          camera.radius = Math.min(camera.upperRadiusLimit || 60, camera.radius + 5);
          break;
        case 'reset':
          camera.alpha = Math.PI / 2;
          camera.beta = Math.PI / 2.1;
          camera.radius = 35;
          camera.target = BABYLON.Vector3.Zero();
          break;
      }
    };

    window.addEventListener('scene3d-zoom', handleZoomEvent as EventListener);
    return () => {
      window.removeEventListener('scene3d-zoom', handleZoomEvent as EventListener);
    };
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Si ya hay una escena, limpiarla
    if (engineRef.current) {
      engineRef.current.dispose();
    }

    // Crear engine
    const engine = new BABYLON.Engine(canvasRef.current, true, {
      preserveDrawingBuffer: true,
      stencil: true,
    });
    engineRef.current = engine;

    // Crear escena
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color4(0.01, 0.01, 0.05, 1);
    sceneRef.current = scene;

    // Cámara con vista cenital ligeramente inclinada para perspectiva arquitectónica
    const camera = new BABYLON.ArcRotateCamera(
      'camera',
      Math.PI / 2,     // Vista totalmente cenital
      Math.PI / 2.1,   // Ligeramente inclinada
      35,              // Más cercana y equilibrada
      BABYLON.Vector3.Zero(),
      scene
    );
    camera.lowerRadiusLimit = 20;
    camera.upperRadiusLimit = 60;
    camera.lowerBetaLimit = 0.1;
    camera.upperBetaLimit = Math.PI / 2.5; // Permite más rotación
    camera.fov = 0.3; // Vista más plana y arquitectónica
    camera.attachControl(canvasRef.current, true);
    camera.wheelPrecision = 30;
    camera.panningSensibility = 50; // Permite pan con clic derecho
    cameraRef.current = camera; // Store camera reference for zoom controls

    // Luz cenital suave
    const light1 = new BABYLON.HemisphericLight(
      'topLight',
      new BABYLON.Vector3(0, 1, 0),
      scene
    );
    light1.intensity = 0.6;
    light1.diffuse = new BABYLON.Color3(0.8, 0.9, 1);

    // Luz direccional para sombras MÁS INTENSA y con ángulo lateral
    const light2 = new BABYLON.DirectionalLight(
      'dirLight',
      new BABYLON.Vector3(0.3, -1, 0.3), // Dirección con ángulo lateral para sombras desplazadas
      scene
    );
    light2.intensity = 0.8; // Mayor intensidad para sombras más visibles
    light2.position = new BABYLON.Vector3(20, 50, 20); // Posición elevada y lateral

    // Shadow generator con ALTA calidad y blur
    const shadowGenerator = new BABYLON.ShadowGenerator(2048, light2);
    shadowGenerator.useBlurExponentialShadowMap = true;
    shadowGenerator.blurKernel = 64; // Mayor blur para sombras más suaves
    shadowGenerator.darkness = 0.5; // Mayor oscuridad en las sombras

    // Crear grid 3D holográfico
    Grid3D.create(scene);

    // Crear datos de ejemplo (nodos) con ALTURAS MUY DIFERENTES para perspectiva evidente
    const baseHeightMultiplier = debugMode ? 8 : 4; // En debug mode, exagerar aún más
    const nodes: NodeData[] = [
      {
        id: 'observer',
        x: 0,
        y: 0,
        z: 15 * baseHeightMultiplier, // ALTURA MÁXIMA - El observador está en lo más alto
        size: 3.0,
        energy: 1.0,
        label: 'Observador',
        color: '#00ffff',
        type: 'self',
      },
      {
        id: 'work',
        x: 12,
        y: -8,
        z: 8 * baseHeightMultiplier, // Altura media-alta
        size: 2.2,
        energy: 0.85,
        label: 'Trabajo',
        color: '#ff00ff',
        type: 'project',
      },
      {
        id: 'health',
        x: -10,
        y: 10,
        z: 2 * baseHeightMultiplier, // Altura BAJA - notoria diferencia
        size: 1.8,
        energy: 0.7,
        label: 'Salud',
        color: '#00ff88',
        type: 'intention',
      },
      {
        id: 'family',
        x: -12,
        y: -10,
        z: 11 * baseHeightMultiplier, // Altura alta
        size: 2.4,
        energy: 0.9,
        label: 'Familia',
        color: '#ffaa00',
        type: 'relationship',
      },
      {
        id: 'creativity',
        x: 15,
        y: 12,
        z: 1 * baseHeightMultiplier, // ALTURA MUY BAJA - contraste máximo
        size: 1.6,
        energy: 0.65,
        label: 'Creatividad',
        color: '#ff0088',
        type: 'project',
      },
      {
        id: 'learning',
        x: 8,
        y: 15,
        z: 6 * baseHeightMultiplier, // Altura media
        size: 1.8,
        energy: 0.75,
        label: 'Aprendizaje',
        color: '#8800ff',
        type: 'intention',
      },
    ];

    // Crear links
    const links: LinkData[] = [
      { source: 'observer', target: 'work', strength: 0.9 },
      { source: 'observer', target: 'health', strength: 0.8 },
      { source: 'observer', target: 'family', strength: 0.95 },
      { source: 'observer', target: 'creativity', strength: 0.7 },
      { source: 'observer', target: 'learning', strength: 0.75 },
      { source: 'work', target: 'creativity', strength: 0.6 },
      { source: 'health', target: 'family', strength: 0.65 },
    ];

    // Crear nodos 3D
    const nodeMeshes = new Map<string, BABYLON.Mesh>();
    nodes.forEach((nodeData) => {
      const mesh = Node3D.create(scene, nodeData, shadowGenerator);
      nodeMeshes.set(nodeData.id, mesh);

      // Interacción con nodos
      mesh.actionManager = new BABYLON.ActionManager(scene);
      mesh.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, () => {
          setSelectedNode(nodeData);
        })
      );
    });

    // Crear links 3D
    links.forEach((linkData) => {
      const sourceNode = nodes.find((n) => n.id === linkData.source);
      const targetNode = nodes.find((n) => n.id === linkData.target);
      if (sourceNode && targetNode) {
        Link3D.create(scene, sourceNode, targetNode, linkData);
      }
    });

    // Crear sistema de partículas
    Particles3D.create(scene);

    // Render loop
    engine.runRenderLoop(() => {
      scene.render();
    });

    // Resize
    const handleResize = () => {
      engine.resize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      engine.dispose();
    };
  }, [debugMode]); // Recrear escena cuando cambie el modo debug

  return (
    <>
      <canvas
        ref={canvasRef}
        className="w-full h-full outline-none"
        style={{ touchAction: 'none' }}
      />

      {/* Botón de Modo Debug 3D */}
      <div className="absolute top-24 left-6 z-50">
        <button
          onClick={() => setDebugMode(!debugMode)}
          className={`px-6 py-3 rounded-lg font-bold shadow-2xl transition-all transform hover:scale-105 ${
            debugMode
              ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white border-2 border-red-300 animate-pulse'
              : 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white border-2 border-cyan-300 hover:from-cyan-600 hover:to-purple-700'
          }`}
        >
          {debugMode ? '🔴 DEBUG 3D ACTIVO' : '🎯 Activar Modo Debug 3D'}
        </button>
        {debugMode && (
          <div className="mt-2 p-3 bg-black/90 backdrop-blur-md border-2 border-red-500/50 rounded-lg">
            <p className="text-red-400 text-xs font-bold text-center">
              Perspectiva EXAGERADA
            </p>
            <p className="text-slate-300 text-xs text-center mt-1">
              Alturas multiplicadas x8
            </p>
            <p className="text-cyan-400 text-xs text-center mt-1">
              Rota la cámara arrastrando
            </p>
          </div>
        )}
      </div>

      {/* Panel de información del nodo */}
      {selectedNode && (
        <div className="absolute top-20 right-6 z-40 w-80 animate-in slide-in-from-right">
          <Card className="bg-black/90 backdrop-blur-md border-cyan-500/50 p-6 shadow-2xl shadow-cyan-500/20">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-white mb-1">{selectedNode.label}</h3>
                <p className="text-xs text-slate-400 uppercase tracking-wider">{selectedNode.type}</p>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-400">Energía</span>
                  <span className="text-cyan-400 font-medium">{(selectedNode.energy * 100).toFixed(0)}%</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-500"
                    style={{ width: `${selectedNode.energy * 100}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-700">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Posición Z</p>
                  <p className="text-white font-mono">{selectedNode.z.toFixed(1)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Tamaño</p>
                  <p className="text-white font-mono">{selectedNode.size.toFixed(1)}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-700">
                <p className="text-xs text-slate-400 leading-relaxed">
                  Este nodo representa un área de tu realidad cuántica con una intensidad energética de{' '}
                  <span className="text-cyan-400 font-medium">{(selectedNode.energy * 100).toFixed(0)}%</span>.
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}

export default Scene3D;
