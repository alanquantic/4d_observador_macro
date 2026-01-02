
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import * as BABYLON from '@babylonjs/core';
import { Node3D } from './Node3D';
import { Link3D } from './Link3D';
import { Grid3D } from './Grid3D';
import { Particles3D } from './Particles3D';
import { Card } from '@/components/ui/card';
import { X, Filter, Eye, EyeOff, Layers, Target, Sparkles, Users, Briefcase, Heart, Lightbulb } from 'lucide-react';

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

const NODE_TYPES = [
  { id: 'all', label: 'Todos', icon: Layers, color: '#ffffff' },
  { id: 'self', label: 'Observador', icon: Target, color: '#00ffff' },
  { id: 'project', label: 'Proyectos', icon: Briefcase, color: '#ff00ff' },
  { id: 'relationship', label: 'Relaciones', icon: Users, color: '#ffaa00' },
  { id: 'intention', label: 'Intenciones', icon: Lightbulb, color: '#00ff88' },
  { id: 'manifestation', label: 'Manifestaciones', icon: Sparkles, color: '#ff0088' },
];

function Scene3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<BABYLON.Engine | null>(null);
  const sceneRef = useRef<BABYLON.Scene | null>(null);
  const cameraRef = useRef<BABYLON.ArcRotateCamera | null>(null);
  const nodeMeshesRef = useRef<Map<string, BABYLON.Mesh>>(new Map());
  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null);
  const [debugMode, setDebugMode] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [nodesData, setNodesData] = useState<NodeData[]>([]);
  const [stats, setStats] = useState({ total: 0, avgEnergy: 0, connections: 0 });

  // Calcular centro de los nodos para centrar la cámara
  const calculateCenter = useCallback((nodes: NodeData[]) => {
    if (nodes.length === 0) return new BABYLON.Vector3(0, 20, 0);
    const sumX = nodes.reduce((acc, n) => acc + n.x, 0) / nodes.length;
    const sumY = nodes.reduce((acc, n) => acc + n.y, 0) / nodes.length;
    const sumZ = nodes.reduce((acc, n) => acc + n.z, 0) / nodes.length;
    return new BABYLON.Vector3(sumX, sumZ / 2, sumY); // Y y Z intercambiados por la perspectiva
  }, []);

  // Listen for zoom events from parent
  useEffect(() => {
    const handleZoomEvent = (event: CustomEvent<{ action: string }>) => {
      const camera = cameraRef.current;
      if (!camera) return;

      switch (event.detail.action) {
        case 'in':
          camera.radius = Math.max(camera.lowerRadiusLimit || 30, camera.radius - 15);
          break;
        case 'out':
          camera.radius = Math.min(camera.upperRadiusLimit || 250, camera.radius + 15);
          break;
        case 'reset':
          camera.alpha = Math.PI / 4;
          camera.beta = Math.PI / 3;
          camera.radius = 150;
          camera.target = calculateCenter(nodesData);
          break;
      }
    };

    window.addEventListener('scene3d-zoom', handleZoomEvent as EventListener);
    return () => {
      window.removeEventListener('scene3d-zoom', handleZoomEvent as EventListener);
    };
  }, [nodesData, calculateCenter]);

  // Filtrar nodos por visibilidad
  useEffect(() => {
    nodeMeshesRef.current.forEach((mesh, nodeId) => {
      const node = nodesData.find(n => n.id === nodeId);
      if (node) {
        mesh.setEnabled(activeFilter === 'all' || node.type === activeFilter);
      }
    });
  }, [activeFilter, nodesData]);

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
    scene.clearColor = new BABYLON.Color4(0.01, 0.02, 0.08, 1);
    sceneRef.current = scene;

    // Cámara con vista isométrica más abierta y centrada
    const camera = new BABYLON.ArcRotateCamera(
      'camera',
      Math.PI / 4,     // Ángulo diagonal para mejor perspectiva
      Math.PI / 3,     // Inclinación más pronunciada (60 grados desde arriba)
      150,             // MAYOR distancia inicial para ver todo
      new BABYLON.Vector3(0, 20, 0), // Centro elevado
      scene
    );
    camera.lowerRadiusLimit = 30;
    camera.upperRadiusLimit = 250; // Permite zoom out mucho más extenso
    camera.lowerBetaLimit = 0.2;
    camera.upperBetaLimit = Math.PI / 2.2;
    camera.fov = 0.6; // FOV más amplio para mejor visión
    camera.attachControl(canvasRef.current, true);
    camera.wheelPrecision = 15; // Más sensible para el zoom
    camera.panningSensibility = 30; // Pan más rápido
    camera.inertia = 0.7; // Inercia suave
    cameraRef.current = camera;

    // Luz cenital suave
    const light1 = new BABYLON.HemisphericLight(
      'topLight',
      new BABYLON.Vector3(0, 1, 0),
      scene
    );
    light1.intensity = 0.7;
    light1.diffuse = new BABYLON.Color3(0.9, 0.95, 1);
    light1.groundColor = new BABYLON.Color3(0.1, 0.1, 0.2);

    // Luz direccional para sombras
    const light2 = new BABYLON.DirectionalLight(
      'dirLight',
      new BABYLON.Vector3(0.5, -1, 0.3),
      scene
    );
    light2.intensity = 0.9;
    light2.position = new BABYLON.Vector3(30, 80, 30);

    // Shadow generator
    const shadowGenerator = new BABYLON.ShadowGenerator(2048, light2);
    shadowGenerator.useBlurExponentialShadowMap = true;
    shadowGenerator.blurKernel = 64;
    shadowGenerator.darkness = 0.4;

    // Crear grid 3D holográfico
    Grid3D.create(scene);

    // Datos de ejemplo más distribuidos y variados
    const baseHeightMultiplier = debugMode ? 6 : 3;
    const nodes: NodeData[] = [
      // Centro - Observador
      {
        id: 'observer',
        x: 0,
        y: 0,
        z: 18 * baseHeightMultiplier,
        size: 3.5,
        energy: 1.0,
        label: 'Observador 4D',
        color: '#00ffff',
        type: 'self',
      },
      // Proyectos - Dispersos en distintas posiciones
      {
        id: 'work',
        x: 25,
        y: -15,
        z: 12 * baseHeightMultiplier,
        size: 2.4,
        energy: 0.85,
        label: 'Proyecto Principal',
        color: '#ff00ff',
        type: 'project',
      },
      {
        id: 'business',
        x: -20,
        y: 25,
        z: 8 * baseHeightMultiplier,
        size: 2.0,
        energy: 0.72,
        label: 'Emprendimiento',
        color: '#ff44aa',
        type: 'project',
      },
      {
        id: 'creativity',
        x: 30,
        y: 20,
        z: 5 * baseHeightMultiplier,
        size: 1.8,
        energy: 0.65,
        label: 'Creatividad',
        color: '#ff0088',
        type: 'project',
      },
      // Relaciones - Cuadrante diferente
      {
        id: 'family',
        x: -25,
        y: -20,
        z: 14 * baseHeightMultiplier,
        size: 2.6,
        energy: 0.92,
        label: 'Familia',
        color: '#ffaa00',
        type: 'relationship',
      },
      {
        id: 'partner',
        x: -15,
        y: -30,
        z: 16 * baseHeightMultiplier,
        size: 2.8,
        energy: 0.95,
        label: 'Pareja',
        color: '#ff6600',
        type: 'relationship',
      },
      {
        id: 'friends',
        x: 15,
        y: -25,
        z: 9 * baseHeightMultiplier,
        size: 2.0,
        energy: 0.78,
        label: 'Amistades',
        color: '#ffcc00',
        type: 'relationship',
      },
      // Intenciones
      {
        id: 'health',
        x: -30,
        y: 10,
        z: 6 * baseHeightMultiplier,
        size: 2.0,
        energy: 0.70,
        label: 'Salud Óptima',
        color: '#00ff88',
        type: 'intention',
      },
      {
        id: 'learning',
        x: 20,
        y: 30,
        z: 10 * baseHeightMultiplier,
        size: 1.9,
        energy: 0.75,
        label: 'Aprendizaje Continuo',
        color: '#44ff88',
        type: 'intention',
      },
      {
        id: 'peace',
        x: -10,
        y: 35,
        z: 11 * baseHeightMultiplier,
        size: 2.2,
        energy: 0.82,
        label: 'Paz Interior',
        color: '#00ffaa',
        type: 'intention',
      },
      // Manifestaciones
      {
        id: 'abundance',
        x: 35,
        y: 5,
        z: 7 * baseHeightMultiplier,
        size: 2.1,
        energy: 0.68,
        label: 'Abundancia',
        color: '#ff0088',
        type: 'manifestation',
      },
      {
        id: 'purpose',
        x: -5,
        y: -35,
        z: 13 * baseHeightMultiplier,
        size: 2.3,
        energy: 0.88,
        label: 'Propósito de Vida',
        color: '#ff44cc',
        type: 'manifestation',
      },
    ];

    // Guardar nodos en el estado
    setNodesData(nodes);

    // Calcular estadísticas
    const avgEnergy = nodes.reduce((acc, n) => acc + n.energy, 0) / nodes.length;

    // Crear links más complejos
    const links: LinkData[] = [
      // Conexiones desde el Observador
      { source: 'observer', target: 'work', strength: 0.9 },
      { source: 'observer', target: 'family', strength: 0.95 },
      { source: 'observer', target: 'partner', strength: 0.98 },
      { source: 'observer', target: 'health', strength: 0.8 },
      { source: 'observer', target: 'peace', strength: 0.85 },
      { source: 'observer', target: 'purpose', strength: 0.92 },
      // Conexiones entre proyectos
      { source: 'work', target: 'creativity', strength: 0.7 },
      { source: 'work', target: 'business', strength: 0.75 },
      { source: 'business', target: 'abundance', strength: 0.65 },
      // Conexiones entre relaciones
      { source: 'family', target: 'partner', strength: 0.88 },
      { source: 'family', target: 'friends', strength: 0.6 },
      // Conexiones de intenciones
      { source: 'health', target: 'peace', strength: 0.72 },
      { source: 'learning', target: 'creativity', strength: 0.68 },
      // Conexiones de manifestaciones
      { source: 'purpose', target: 'abundance', strength: 0.58 },
      { source: 'peace', target: 'purpose', strength: 0.78 },
    ];

    setStats({ total: nodes.length, avgEnergy: Math.round(avgEnergy * 100), connections: links.length });

    // Crear nodos 3D y guardarlos en el ref
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

      // Hover effect
      mesh.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOverTrigger, () => {
          scene.hoverCursor = 'pointer';
        })
      );
    });
    nodeMeshesRef.current = nodeMeshes;

    // Crear links 3D
    links.forEach((linkData) => {
      const sourceNode = nodes.find((n) => n.id === linkData.source);
      const targetNode = nodes.find((n) => n.id === linkData.target);
      if (sourceNode && targetNode) {
        Link3D.create(scene, sourceNode, targetNode, linkData);
      }
    });

    // Centrar cámara en el centro de los nodos después de crearlos
    const center = new BABYLON.Vector3(0, 20, 0);
    camera.target = center;

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

      {/* Panel de Controles Superior Izquierdo */}
      <div className="absolute top-24 left-6 z-50 space-y-3">
        {/* Botón de Modo Debug */}
        <button
          onClick={() => setDebugMode(!debugMode)}
          className={`px-5 py-2.5 rounded-lg font-semibold shadow-xl transition-all transform hover:scale-105 text-sm ${
            debugMode
              ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white border border-red-300'
              : 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white border border-cyan-300/50 hover:from-cyan-600 hover:to-purple-700'
          }`}
        >
          {debugMode ? '🔴 Desactivar Debug 3D' : '🎯 Activar Modo Debug 3D'}
        </button>

        {/* Botón de Filtros */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`w-full px-5 py-2.5 rounded-lg font-semibold shadow-xl transition-all flex items-center justify-center gap-2 text-sm ${
            showFilters
              ? 'bg-purple-600 text-white border border-purple-400'
              : 'bg-black/70 backdrop-blur-sm text-slate-200 border border-slate-600 hover:bg-slate-800'
          }`}
        >
          <Filter className="h-4 w-4" />
          Filtrar Nodos
        </button>

        {/* Panel de Filtros */}
        {showFilters && (
          <Card className="bg-black/90 backdrop-blur-md border-purple-500/50 p-4 shadow-2xl">
            <p className="text-purple-300 text-xs font-semibold mb-3 uppercase tracking-wider">Tipos de Nodo</p>
            <div className="space-y-2">
              {NODE_TYPES.map((type) => {
                const Icon = type.icon;
                const isActive = activeFilter === type.id;
                return (
                  <button
                    key={type.id}
                    onClick={() => setActiveFilter(type.id)}
                    className={`w-full px-3 py-2 rounded-lg flex items-center gap-3 transition-all text-sm ${
                      isActive
                        ? 'bg-purple-500/30 border border-purple-400/50 text-white'
                        : 'bg-slate-800/50 border border-slate-700 text-slate-300 hover:bg-slate-700/50'
                    }`}
                  >
                    <Icon className="h-4 w-4" style={{ color: type.color }} />
                    <span>{type.label}</span>
                    {isActive && <Eye className="h-3 w-3 ml-auto text-purple-400" />}
                  </button>
                );
              })}
            </div>
          </Card>
        )}

        {/* Estadísticas */}
        <Card className="bg-black/80 backdrop-blur-md border-cyan-500/30 p-4">
          <p className="text-cyan-400 text-xs font-semibold mb-3 uppercase tracking-wider">Estadísticas</p>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
              <p className="text-xs text-slate-400">Nodos</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-cyan-400">{stats.avgEnergy}%</p>
              <p className="text-xs text-slate-400">Energía</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-400">{stats.connections}</p>
              <p className="text-xs text-slate-400">Links</p>
            </div>
          </div>
        </Card>

        {debugMode && (
          <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
            <p className="text-red-300 text-xs font-bold text-center">
              🔍 MODO DEBUG ACTIVO
            </p>
            <p className="text-slate-300 text-xs text-center mt-1">
              Alturas x6 - Perspectiva exagerada
            </p>
          </div>
        )}
      </div>

      {/* Leyenda de Colores - Esquina Superior Derecha (debajo del panel de info) */}
      <div className="absolute top-[420px] right-6 z-30">
        <Card className="bg-black/80 backdrop-blur-md border-slate-600/50 p-3">
          <p className="text-slate-400 text-xs font-semibold mb-2 uppercase tracking-wider">Leyenda</p>
          <div className="space-y-1.5">
            {NODE_TYPES.filter(t => t.id !== 'all').map((type) => (
              <div key={type.id} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: type.color, boxShadow: `0 0 8px ${type.color}` }} />
                <span className="text-xs text-slate-300">{type.label}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Panel de información del nodo seleccionado */}
      {selectedNode && (
        <div className="absolute top-20 right-6 z-40 w-80 animate-in slide-in-from-right">
          <Card className="bg-black/90 backdrop-blur-md border-cyan-500/50 p-6 shadow-2xl shadow-cyan-500/20">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-white mb-1">{selectedNode.label}</h3>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: selectedNode.color }} />
                  <p className="text-xs text-slate-400 uppercase tracking-wider">
                    {NODE_TYPES.find(t => t.id === selectedNode.type)?.label || selectedNode.type}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-slate-400 hover:text-white transition-colors p-1 hover:bg-slate-700 rounded"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-400">Nivel de Energía</span>
                  <span className="text-cyan-400 font-bold">{(selectedNode.energy * 100).toFixed(0)}%</span>
                </div>
                <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ 
                      width: `${selectedNode.energy * 100}%`,
                      background: `linear-gradient(90deg, ${selectedNode.color}, #8b5cf6)`
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-700">
                <div className="text-center">
                  <p className="text-xs text-slate-500 mb-1">Altura</p>
                  <p className="text-white font-mono text-sm">{selectedNode.z.toFixed(0)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-500 mb-1">Tamaño</p>
                  <p className="text-white font-mono text-sm">{selectedNode.size.toFixed(1)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-500 mb-1">Pos X/Y</p>
                  <p className="text-white font-mono text-sm">{selectedNode.x}/{selectedNode.y}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-700">
                <p className="text-xs text-slate-400 leading-relaxed">
                  Este nodo representa <span className="text-white font-medium">{selectedNode.label}</span> en tu 
                  mapa dimensional con una intensidad energética de{' '}
                  <span style={{ color: selectedNode.color }} className="font-bold">{(selectedNode.energy * 100).toFixed(0)}%</span>.
                  {selectedNode.energy >= 0.9 && ' ¡Excelente nivel de energía!'}
                  {selectedNode.energy < 0.7 && ' Considera enfocar más atención aquí.'}
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
