
'use client';

import { useRef, useState, useEffect, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Line, Float } from '@react-three/drei';
import * as THREE from 'three';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Eye, Target, Users, Sparkles, Zap, Activity, 
  TrendingUp, GitBranch, Lightbulb, RefreshCw,
  ZoomIn, ZoomOut, RotateCcw
} from 'lucide-react';

// ============================================
// TYPES & INTERFACES
// ============================================

type ViewMode = 'energy' | 'strategy' | 'relational' | 'manifestations' | 'futures';

interface NodeData {
  id: string;
  type: 'observer' | 'project' | 'relationship' | 'manifestation' | 'energy' | 'task';
  position: [number, number, number];
  label: string;
  color: string;
  size: number;
  progress?: number;
  energy?: number;
  category?: string;
  status?: string;
}

interface ConnectionData {
  from: string;
  to: string;
  energy: number;
  animated: boolean;
}

interface GameBoard3DProps {
  recentData: {
    projects: any[];
    relationships: any[];
    manifestations: any[];
    entries: any[];
  };
}

// ============================================
// HOLOGRAPHIC GRID BACKGROUND (Layer 1)
// ============================================

function HolographicGrid() {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
    }
  });

  const gridShader = useMemo(() => ({
    uniforms: {
      uTime: { value: 0 },
      uColor1: { value: new THREE.Color(0x0a0a2e) },
      uColor2: { value: new THREE.Color(0x16213e) },
      uColor3: { value: new THREE.Color(0x00d4ff) },
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vPosition;
      
      void main() {
        vUv = uv;
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec3 uColor1;
      uniform vec3 uColor2;
      uniform vec3 uColor3;
      
      varying vec2 vUv;
      varying vec3 vPosition;
      
      void main() {
        // Radial cosmic gradient
        vec2 center = vec2(0.5, 0.5);
        float dist = distance(vUv, center);
        
        // Nebula effect
        float nebula = sin(dist * 10.0 - uTime * 0.5) * 0.5 + 0.5;
        
        // Holographic grid
        float gridX = step(0.95, fract(vPosition.x * 2.0));
        float gridY = step(0.95, fract(vPosition.y * 2.0));
        float grid = max(gridX, gridY);
        
        // Distance-based brightness
        float brightness = 1.0 - smoothstep(0.0, 1.0, dist);
        
        // Color mixing
        vec3 color = mix(uColor1, uColor2, dist);
        color = mix(color, uColor3, nebula * 0.2);
        color += uColor3 * grid * brightness * 0.5;
        
        // Pulsing glow
        float pulse = sin(uTime * 2.0) * 0.1 + 0.9;
        color *= pulse;
        
        gl_FragColor = vec4(color, 0.95);
      }
    `,
  }), []);

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -5, 0]}>
      <planeGeometry args={[100, 100, 50, 50]} />
      <shaderMaterial
        ref={materialRef}
        {...gridShader}
        transparent
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// ============================================
// QUANTUM PARTICLE SYSTEM (Layer 3)
// ============================================

function ParticleField() {
  const particlesRef = useRef<THREE.Points>(null);
  const count = 500;

  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // Distributed in 3D space around the scene
      positions[i3] = (Math.random() - 0.5) * 50;
      positions[i3 + 1] = Math.random() * 20 - 5;
      positions[i3 + 2] = (Math.random() - 0.5) * 50;

      // Cyan/magenta quantum colors
      const color = Math.random() > 0.5 ? new THREE.Color(0x00d4ff) : new THREE.Color(0xff00ff);
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;

      sizes[i] = Math.random() * 2 + 0.5;
    }

    return { positions, colors, sizes };
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.getElapsedTime() * 0.05;
      
      // Parallax effect
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        positions[i3 + 1] += Math.sin(state.clock.getElapsedTime() + i) * 0.002;
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  const geometry = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(particles.positions, 3));
    geom.setAttribute('color', new THREE.BufferAttribute(particles.colors, 3));
    geom.setAttribute('size', new THREE.BufferAttribute(particles.sizes, 1));
    return geom;
  }, [particles]);

  return (
    <points ref={particlesRef} geometry={geometry}>
      <pointsMaterial
        size={0.3}
        vertexColors
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// ============================================
// NODE SPHERE WITH GLOW (Layer 2)
// ============================================

interface NodeSphereProps {
  node: NodeData;
  onClick: () => void;
  isSelected: boolean;
}

function NodeSphere({ node, onClick, isSelected }: NodeSphereProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      // Vibración 4D sutil
      const vibration = Math.sin(state.clock.getElapsedTime() * 2 + node.position[0]) * 0.03;
      meshRef.current.position.y = node.position[1] + vibration;
      
      // Rotación suave
      meshRef.current.rotation.y += 0.01;
      
      // Z-depth variable según energía
      if (node.energy) {
        const depthPulse = Math.sin(state.clock.getElapsedTime() * node.energy / 50) * 0.2;
        meshRef.current.scale.setScalar(1 + depthPulse * 0.1);
      }
    }

    // Glow pulsante
    if (glowRef.current) {
      const pulse = Math.sin(state.clock.getElapsedTime() * 3) * 0.2 + 0.8;
      glowRef.current.scale.setScalar((isSelected ? 1.8 : 1.4) * pulse);
    }
  });

  const nodeColor = new THREE.Color(node.color);
  const isObserver = node.type === 'observer';

  return (
    <group position={node.position}>
      {/* Sombra radial bajo la esfera */}
      <mesh position={[0, -node.size * 0.5 - 0.3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[node.size * 0.8, 32]} />
        <meshBasicMaterial 
          color="#000000" 
          transparent 
          opacity={0.3} 
          blending={THREE.MultiplyBlending}
        />
      </mesh>

      {/* Glow exterior */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[node.size * 1.2, 32, 32]} />
        <meshBasicMaterial 
          color={nodeColor} 
          transparent 
          opacity={0.2} 
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Esfera principal con material suave y volumen */}
      <mesh
        ref={meshRef}
        onClick={onClick}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        <sphereGeometry args={[node.size, 32, 32]} />
        <meshPhongMaterial 
          color={nodeColor}
          emissive={nodeColor}
          emissiveIntensity={isObserver ? 0.8 : 0.3}
          shininess={100}
          specular={new THREE.Color(0xffffff)}
        />
      </mesh>

      {/* Anillo extra para el nodo Observer */}
      {isObserver && (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.3}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[node.size * 1.5, 0.1, 16, 32]} />
            <meshBasicMaterial 
              color={nodeColor} 
              transparent 
              opacity={0.6}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        </Float>
      )}

      {/* Highlight superior para efecto de luz cenital */}
      <mesh position={[0, node.size * 0.5, 0]}>
        <sphereGeometry args={[node.size * 0.3, 16, 16]} />
        <meshBasicMaterial 
          color="#ffffff" 
          transparent 
          opacity={hovered ? 0.5 : 0.3}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

// ============================================
// CONEXIÓN 3D CON VOLUMEN (Layer 2)
// ============================================

interface Connection3DProps {
  from: NodeData;
  to: NodeData;
  energy: number;
  animated: boolean;
}

function Connection3D({ from, to, energy, animated }: Connection3DProps) {
  const tubeRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (animated && tubeRef.current) {
      const material = tubeRef.current.material as THREE.MeshBasicMaterial;
      material.opacity = 0.3 + Math.sin(state.clock.getElapsedTime() * 3) * 0.2;
    }
  });

  const points = useMemo(() => {
    const start = new THREE.Vector3(...from.position);
    const end = new THREE.Vector3(...to.position);
    
    // Curva con arco para darle volumen
    const mid = new THREE.Vector3()
      .lerpVectors(start, end, 0.5)
      .add(new THREE.Vector3(0, 2, 0));

    const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
    return curve.getPoints(50);
  }, [from, to]);

  const tubeGeometry = useMemo(() => {
    const start = new THREE.Vector3(...from.position);
    const end = new THREE.Vector3(...to.position);
    const mid = new THREE.Vector3()
      .lerpVectors(start, end, 0.5)
      .add(new THREE.Vector3(0, 2, 0));

    const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
    return new THREE.TubeGeometry(curve, 50, 0.05, 8, false);
  }, [from, to]);

  const connectionColor = new THREE.Color().lerpColors(
    new THREE.Color(from.color),
    new THREE.Color(to.color),
    0.5
  );

  return (
    <group>
      {/* Línea base con blur */}
      <Line
        points={points}
        color={connectionColor}
        lineWidth={1}
        transparent
        opacity={0.3}
      />

      {/* Tubo con volumen */}
      <mesh ref={tubeRef} geometry={tubeGeometry}>
        <meshBasicMaterial 
          color={connectionColor}
          transparent
          opacity={energy / 100}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Glow exterior */}
      <mesh geometry={tubeGeometry} scale={1.5}>
        <meshBasicMaterial 
          color={connectionColor}
          transparent
          opacity={0.1}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

// ============================================
// ESCENA 3D PRINCIPAL
// ============================================

interface Scene3DProps {
  nodes: NodeData[];
  connections: ConnectionData[];
  onNodeClick: (nodeId: string) => void;
  selectedNodeId: string | null;
}

function Scene3D({ nodes, connections, onNodeClick, selectedNodeId }: Scene3DProps) {
  const { camera } = useThree();

  useEffect(() => {
    // Configurar cámara top-down
    camera.position.set(0, 25, 0);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }, [camera]);

  return (
    <>
      {/* Iluminación cenital suave */}
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 30, 0]} intensity={1} color="#ffffff" />
      <pointLight position={[0, 20, 0]} intensity={0.5} color="#00d4ff" />
      
      {/* Layer 1: Fondo holográfico */}
      <HolographicGrid />
      
      {/* Layer 2: Conexiones con volumen */}
      {connections.map((conn, idx) => {
        const fromNode = nodes.find(n => n.id === conn.from);
        const toNode = nodes.find(n => n.id === conn.to);
        if (!fromNode || !toNode) return null;
        
        return (
          <Connection3D
            key={`${conn.from}-${conn.to}-${idx}`}
            from={fromNode}
            to={toNode}
            energy={conn.energy}
            animated={conn.animated}
          />
        );
      })}
      
      {/* Layer 2: Nodos como esferas 3D */}
      {nodes.map(node => (
        <NodeSphere
          key={node.id}
          node={node}
          onClick={() => onNodeClick(node.id)}
          isSelected={selectedNodeId === node.id}
        />
      ))}
      
      {/* Layer 3: Partículas con parallax */}
      <ParticleField />
    </>
  );
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function GameBoard3D({ recentData }: GameBoard3DProps) {
  const [nodes, setNodes] = useState<NodeData[]>([]);
  const [connections, setConnections] = useState<ConnectionData[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('energy');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [autoRotate, setAutoRotate] = useState(false);

  // Procesar datos y crear nodos/conexiones
  useEffect(() => {
    const processedNodes: NodeData[] = [];
    const processedConnections: ConnectionData[] = [];

    // Nodo Observer central
    const observerNode: NodeData = {
      id: 'observer',
      type: 'observer',
      position: [0, 0, 0],
      label: 'El Observador',
      color: '#00d4ff',
      size: 1.5,
      energy: 100,
    };
    processedNodes.push(observerNode);

    // Procesar proyectos
    recentData.projects?.slice(0, 8).forEach((project, idx) => {
      const angle = (idx / 8) * Math.PI * 2;
      const radius = 8;
      const node: NodeData = {
        id: `project-${project.id}`,
        type: 'project',
        position: [
          Math.cos(angle) * radius,
          Math.random() * 2 - 1,
          Math.sin(angle) * radius
        ],
        label: project.name,
        color: '#ff00ff',
        size: 0.8 + (project.progress || 0) / 100,
        progress: project.progress,
        energy: project.energyInvested || 50,
        status: project.status,
      };
      processedNodes.push(node);
      
      processedConnections.push({
        from: 'observer',
        to: node.id,
        energy: project.energyInvested || 50,
        animated: project.status === 'active',
      });
    });

    // Procesar relaciones
    recentData.relationships?.slice(0, 6).forEach((rel, idx) => {
      const angle = (idx / 6) * Math.PI * 2 + Math.PI / 6;
      const radius = 12;
      const node: NodeData = {
        id: `relationship-${rel.id}`,
        type: 'relationship',
        position: [
          Math.cos(angle) * radius,
          Math.random() * 2 - 1,
          Math.sin(angle) * radius
        ],
        label: rel.name,
        color: '#ffaa00',
        size: 0.6 + (rel.qualityScore || 50) / 100,
        energy: rel.energyExchange || 50,
      };
      processedNodes.push(node);
      
      processedConnections.push({
        from: 'observer',
        to: node.id,
        energy: rel.energyExchange || 50,
        animated: true,
      });
    });

    // Procesar manifestaciones
    recentData.manifestations?.slice(0, 5).forEach((manifest, idx) => {
      const angle = (idx / 5) * Math.PI * 2 + Math.PI / 4;
      const radius = 15;
      const node: NodeData = {
        id: `manifestation-${manifest.id}`,
        type: 'manifestation',
        position: [
          Math.cos(angle) * radius,
          Math.random() * 3,
          Math.sin(angle) * radius
        ],
        label: manifest.title,
        color: '#00ff88',
        size: 0.7,
        energy: 70,
      };
      processedNodes.push(node);
      
      processedConnections.push({
        from: 'observer',
        to: node.id,
        energy: 70,
        animated: manifest.status === 'in_progress',
      });
    });

    setNodes(processedNodes);
    setConnections(processedConnections);
  }, [recentData, viewMode]);

  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  const viewModes = [
    { id: 'energy' as ViewMode, label: 'Energía', icon: Zap, color: 'from-yellow-500 to-orange-600' },
    { id: 'strategy' as ViewMode, label: 'Estrategia', icon: Target, color: 'from-blue-500 to-purple-600' },
    { id: 'relational' as ViewMode, label: 'Relaciones', icon: Users, color: 'from-pink-500 to-rose-600' },
    { id: 'manifestations' as ViewMode, label: 'Manifestaciones', icon: Sparkles, color: 'from-green-500 to-emerald-600' },
    { id: 'futures' as ViewMode, label: 'Futuros', icon: TrendingUp, color: 'from-cyan-500 to-blue-600' },
  ];

  return (
    <Card className="col-span-full border-2 border-cyan-500/30 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 shadow-2xl shadow-cyan-500/20">
      <CardHeader className="border-b border-cyan-500/20">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/50">
              <Eye className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Centro de Control Cuántico Leviathan
              </CardTitle>
              <p className="text-xs text-slate-400 mt-1">Vista Cenital 4D • Profundidad Real • Quantum Mapping</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={autoRotate ? "default" : "outline"}
              onClick={() => setAutoRotate(!autoRotate)}
              className="gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              {autoRotate ? 'Detener' : 'Auto Rotar'}
            </Button>
            <Badge variant="outline" className="bg-cyan-500/10 text-cyan-400 border-cyan-500/30">
              {nodes.length} Nodos • {connections.length} Conexiones
            </Badge>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex flex-wrap gap-2 mt-4">
          {viewModes.map(mode => {
            const Icon = mode.icon;
            return (
              <Button
                key={mode.id}
                size="sm"
                variant={viewMode === mode.id ? "default" : "outline"}
                onClick={() => setViewMode(mode.id)}
                className={viewMode === mode.id ? `bg-gradient-to-r ${mode.color} text-white border-0` : ''}
              >
                <Icon className="w-4 h-4 mr-2" />
                {mode.label}
              </Button>
            );
          })}
        </div>
      </CardHeader>

      <CardContent className="p-0 relative">
        {/* Canvas 3D */}
        <div className="w-full h-[600px] bg-black/50 relative">
          <Canvas
            camera={{ position: [0, 25, 0], fov: 60 }}
            gl={{ antialias: true, alpha: true }}
          >
            <Suspense fallback={null}>
              <Scene3D
                nodes={nodes}
                connections={connections}
                onNodeClick={setSelectedNodeId}
                selectedNodeId={selectedNodeId}
              />
              <OrbitControls
                enablePan={true}
                enableZoom={true}
                enableRotate={true}
                autoRotate={autoRotate}
                autoRotateSpeed={0.5}
                maxPolarAngle={Math.PI / 2.2}
                minPolarAngle={Math.PI / 4}
                maxDistance={50}
                minDistance={10}
              />
            </Suspense>
          </Canvas>

          {/* Info Overlay */}
          {selectedNode && (
            <div className="absolute bottom-4 left-4 right-4 bg-slate-900/95 backdrop-blur-xl border border-cyan-500/30 rounded-lg p-4 shadow-2xl">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div 
                      className="w-4 h-4 rounded-full shadow-lg"
                      style={{ backgroundColor: selectedNode.color, boxShadow: `0 0 10px ${selectedNode.color}` }}
                    />
                    <h3 className="text-lg font-bold text-white">{selectedNode.label}</h3>
                    <Badge variant="outline" className="text-xs">
                      {selectedNode.type}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {selectedNode.energy && (
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-yellow-400" />
                        <span className="text-slate-300">Energía: {selectedNode.energy}%</span>
                      </div>
                    )}
                    {selectedNode.progress !== undefined && (
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-green-400" />
                        <span className="text-slate-300">Progreso: {selectedNode.progress}%</span>
                      </div>
                    )}
                    {selectedNode.status && (
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-blue-400" />
                        <span className="text-slate-300">Estado: {selectedNode.status}</span>
                      </div>
                    )}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedNodeId(null)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </Button>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-md rounded-lg p-3 text-xs text-slate-300 space-y-1">
            <p>🖱️ Click izquierdo: Rotar vista</p>
            <p>🖱️ Click derecho: Mover cámara</p>
            <p>🖱️ Rueda: Zoom</p>
            <p>🎯 Click en nodo: Ver detalles</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
