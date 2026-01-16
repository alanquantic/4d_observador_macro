'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import * as BABYLON from '@babylonjs/core';

// ═══════════════════════════════════════════════════════════════════════════
// Sistema Solar Leviathan - Visualización 3D de Economía Agéntica
// Proyectos orbitan como planetas alrededor del Sol (Usuario/Core)
// ═══════════════════════════════════════════════════════════════════════════

interface ExternalProjectData {
  id: string;
  name: string;
  totalRevenue: number;
  monthlyRevenue: number;
  balance: number;
  transactionsPerHour: number;
  agentMode: string;
  decisionsCount: number;
}

interface SolarSystemProps {
  projects: ExternalProjectData[];
  globalMetrics: {
    totalBalance: number;
    totalRevenue: number;
    systemHealth: number;
  };
  recentDecisions?: Array<{
    id: string;
    projectName: string;
    revenue: number;
    timestamp: string;
  }>;
  onProjectClick?: (projectId: string) => void;
}

export function SolarSystem3D({ 
  projects, 
  globalMetrics, 
  recentDecisions = [],
  onProjectClick 
}: SolarSystemProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<BABYLON.Engine | null>(null);
  const sceneRef = useRef<BABYLON.Scene | null>(null);
  const planetsRef = useRef<Map<string, BABYLON.Mesh>>(new Map());
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null);

  // Crear la escena del Sistema Solar
  const createScene = useCallback((engine: BABYLON.Engine, canvas: HTMLCanvasElement) => {
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color4(0.02, 0.02, 0.05, 1);

    // Cámara orbital
    const camera = new BABYLON.ArcRotateCamera(
      'camera',
      Math.PI / 4,
      Math.PI / 3,
      80,
      new BABYLON.Vector3(0, 0, 0),
      scene
    );
    camera.attachControl(canvas, true);
    camera.lowerRadiusLimit = 30;
    camera.upperRadiusLimit = 150;
    camera.wheelPrecision = 20;

    // Luz ambiental suave
    const ambientLight = new BABYLON.HemisphericLight(
      'ambient',
      new BABYLON.Vector3(0, 1, 0),
      scene
    );
    ambientLight.intensity = 0.3;
    ambientLight.diffuse = new BABYLON.Color3(0.5, 0.5, 0.7);

    // ═══════════════════════════════════════════════════════════════
    // SOL CENTRAL - Representa al usuario/liquidez total
    // ═══════════════════════════════════════════════════════════════
    
    // Calcular tamaño del sol basado en balance total
    const sunSize = Math.max(5, Math.min(12, 5 + Math.log10(globalMetrics.totalBalance + 1) * 2));
    
    const sun = BABYLON.MeshBuilder.CreateSphere('sun', {
      diameter: sunSize,
      segments: 64
    }, scene);
    sun.position = new BABYLON.Vector3(0, 0, 0);

    // Material del sol - dorado brillante
    const sunMaterial = new BABYLON.StandardMaterial('sunMat', scene);
    const healthFactor = globalMetrics.systemHealth / 100;
    
    // Color basado en salud: dorado (saludable) → rojo (problemas)
    sunMaterial.emissiveColor = new BABYLON.Color3(
      1,
      0.6 + healthFactor * 0.3,
      healthFactor * 0.3
    );
    sunMaterial.diffuseColor = sunMaterial.emissiveColor;
    sun.material = sunMaterial;

    // Glow del sol
    const sunGlow = BABYLON.MeshBuilder.CreateSphere('sunGlow', {
      diameter: sunSize * 1.8,
      segments: 32
    }, scene);
    sunGlow.position = sun.position.clone();
    const sunGlowMat = new BABYLON.StandardMaterial('sunGlowMat', scene);
    sunGlowMat.emissiveColor = sunMaterial.emissiveColor.scale(0.5);
    sunGlowMat.alpha = 0.2;
    sunGlowMat.alphaMode = BABYLON.Engine.ALPHA_ADD;
    sunGlow.material = sunGlowMat;

    // Corona del sol
    const corona = BABYLON.MeshBuilder.CreateSphere('corona', {
      diameter: sunSize * 2.5,
      segments: 16
    }, scene);
    corona.position = sun.position.clone();
    const coronaMat = new BABYLON.StandardMaterial('coronaMat', scene);
    coronaMat.emissiveColor = new BABYLON.Color3(1, 0.8, 0.3);
    coronaMat.alpha = 0.08;
    coronaMat.alphaMode = BABYLON.Engine.ALPHA_ADD;
    corona.material = coronaMat;

    // Luz del sol
    const sunLight = new BABYLON.PointLight(
      'sunLight',
      new BABYLON.Vector3(0, 0, 0),
      scene
    );
    sunLight.intensity = 2;
    sunLight.diffuse = new BABYLON.Color3(1, 0.9, 0.7);

    // ═══════════════════════════════════════════════════════════════
    // PLANETAS - Proyectos externos (Legal Shield, Capital Miner)
    // ═══════════════════════════════════════════════════════════════
    
    const planetColors = [
      new BABYLON.Color3(0.2, 0.6, 1),    // Azul
      new BABYLON.Color3(0.9, 0.3, 0.5),  // Rosa
      new BABYLON.Color3(0.3, 0.9, 0.5),  // Verde
      new BABYLON.Color3(0.9, 0.7, 0.2),  // Naranja
      new BABYLON.Color3(0.7, 0.3, 0.9),  // Púrpura
      new BABYLON.Color3(0.2, 0.9, 0.9),  // Cyan
    ];

    projects.forEach((project, index) => {
      // Calcular propiedades del planeta
      const revenue = project.totalRevenue || 1;
      const activity = project.transactionsPerHour || 0;
      
      // Tamaño basado en ingresos (logarítmico)
      const planetSize = Math.max(1.5, Math.min(5, 1.5 + Math.log10(revenue + 1) * 1.2));
      
      // Radio de órbita basado en posición
      const orbitRadius = 20 + (index * 12);
      
      // Velocidad de órbita basada en actividad
      const orbitSpeed = 0.1 + Math.min(0.5, activity / 20);
      
      // Ángulo inicial distribuido
      const initialAngle = (2 * Math.PI * index) / Math.max(projects.length, 1);

      // Crear órbita visual
      const orbitPoints: BABYLON.Vector3[] = [];
      for (let i = 0; i <= 64; i++) {
        const angle = (2 * Math.PI * i) / 64;
        orbitPoints.push(new BABYLON.Vector3(
          orbitRadius * Math.cos(angle),
          0,
          orbitRadius * Math.sin(angle)
        ));
      }
      const orbit = BABYLON.MeshBuilder.CreateLines(`orbit_${project.id}`, {
        points: orbitPoints
      }, scene);
      const orbitColor = project.agentMode === 'paused' 
        ? new BABYLON.Color3(0.5, 0.2, 0.2)
        : new BABYLON.Color3(0.2, 0.3, 0.5);
      orbit.color = orbitColor;
      orbit.alpha = 0.3;

      // Crear planeta
      const planet = BABYLON.MeshBuilder.CreateSphere(`planet_${project.id}`, {
        diameter: planetSize,
        segments: 32
      }, scene);

      // Posición inicial
      planet.position = new BABYLON.Vector3(
        orbitRadius * Math.cos(initialAngle),
        0,
        orbitRadius * Math.sin(initialAngle)
      );

      // Material del planeta
      const planetMat = new BABYLON.StandardMaterial(`planetMat_${project.id}`, scene);
      const baseColor = planetColors[index % planetColors.length];
      
      if (project.agentMode === 'paused') {
        // Gris si está pausado
        planetMat.diffuseColor = new BABYLON.Color3(0.4, 0.4, 0.4);
        planetMat.emissiveColor = new BABYLON.Color3(0.2, 0.2, 0.2);
      } else {
        planetMat.diffuseColor = baseColor;
        planetMat.emissiveColor = baseColor.scale(0.4);
      }
      planetMat.specularColor = new BABYLON.Color3(0.5, 0.5, 0.5);
      planet.material = planetMat;

      // Glow del planeta basado en actividad
      if (activity > 0) {
        const planetGlow = BABYLON.MeshBuilder.CreateSphere(`planetGlow_${project.id}`, {
          diameter: planetSize * 1.5,
          segments: 16
        }, scene);
        planetGlow.parent = planet;
        planetGlow.position = BABYLON.Vector3.Zero();
        
        const glowMat = new BABYLON.StandardMaterial(`planetGlowMat_${project.id}`, scene);
        glowMat.emissiveColor = baseColor;
        glowMat.alpha = Math.min(0.3, activity / 30);
        glowMat.alphaMode = BABYLON.Engine.ALPHA_ADD;
        planetGlow.material = glowMat;
      }

      // Guardar metadata para animación
      planet.metadata = {
        projectId: project.id,
        projectName: project.name,
        orbitRadius,
        orbitSpeed,
        angle: initialAngle,
        baseColor,
        revenue: project.totalRevenue,
        activity: project.transactionsPerHour,
      };

      // Guardar referencia
      planetsRef.current.set(project.id, planet);

      // Hacer el planeta clickeable
      planet.actionManager = new BABYLON.ActionManager(scene);
      planet.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(
          BABYLON.ActionManager.OnPickTrigger,
          () => {
            setSelectedPlanet(project.id);
            if (onProjectClick) onProjectClick(project.id);
          }
        )
      );
    });

    // ═══════════════════════════════════════════════════════════════
    // ESTRELLAS DE FONDO
    // ═══════════════════════════════════════════════════════════════
    
    const starCount = 500;
    const starPositions: number[] = [];
    
    for (let i = 0; i < starCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 200 + Math.random() * 100;
      
      starPositions.push(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi)
      );
    }

    const starMesh = new BABYLON.Mesh('stars', scene);
    const starVertexData = new BABYLON.VertexData();
    starVertexData.positions = starPositions;
    starVertexData.applyToMesh(starMesh);

    const starMaterial = new BABYLON.StandardMaterial('starMat', scene);
    starMaterial.emissiveColor = new BABYLON.Color3(1, 1, 1);
    starMaterial.pointsCloud = true;
    starMaterial.pointSize = 2;
    starMesh.material = starMaterial;

    // ═══════════════════════════════════════════════════════════════
    // ANIMACIÓN DEL SISTEMA
    // ═══════════════════════════════════════════════════════════════
    
    let time = 0;
    scene.registerBeforeRender(() => {
      time += engine.getDeltaTime() / 1000;

      // Animar sol (pulso suave)
      const sunPulse = 1 + Math.sin(time * 2) * 0.03;
      sun.scaling = new BABYLON.Vector3(sunPulse, sunPulse, sunPulse);
      sunGlow.scaling = new BABYLON.Vector3(sunPulse * 1.1, sunPulse * 1.1, sunPulse * 1.1);

      // Rotar corona lentamente
      corona.rotation.y += 0.001;
      corona.rotation.x += 0.0005;

      // Animar planetas (órbitas)
      planetsRef.current.forEach((planet) => {
        if (planet.metadata) {
          const { orbitRadius, orbitSpeed } = planet.metadata;
          planet.metadata.angle += orbitSpeed * 0.02;
          
          planet.position.x = orbitRadius * Math.cos(planet.metadata.angle);
          planet.position.z = orbitRadius * Math.sin(planet.metadata.angle);

          // Rotación propia del planeta
          planet.rotation.y += 0.01;

          // Pulso basado en actividad
          if (planet.metadata.activity > 0) {
            const activityPulse = 1 + Math.sin(time * (2 + planet.metadata.activity / 10)) * 0.05;
            planet.scaling = new BABYLON.Vector3(activityPulse, activityPulse, activityPulse);
          }
        }
      });
    });

    return scene;
  }, [projects, globalMetrics, onProjectClick]);

  // Crear efecto de "rayo" cuando hay una transacción
  const createTransactionRay = useCallback((projectId: string, revenue: number) => {
    const scene = sceneRef.current;
    const planet = planetsRef.current.get(projectId);
    
    if (!scene || !planet) return;

    // Crear línea desde el sol al planeta
    const rayPoints = [
      new BABYLON.Vector3(0, 0, 0), // Sol
      planet.position.clone()        // Planeta
    ];

    const ray = BABYLON.MeshBuilder.CreateLines(`ray_${Date.now()}`, {
      points: rayPoints
    }, scene);

    // Color basado en si es ingreso positivo
    ray.color = revenue > 0 
      ? new BABYLON.Color3(0.2, 1, 0.5)   // Verde para ingresos
      : new BABYLON.Color3(1, 0.3, 0.3);  // Rojo para otros

    // Animación de desvanecimiento
    let alpha = 1;
    const fadeInterval = setInterval(() => {
      alpha -= 0.05;
      ray.alpha = alpha;
      
      if (alpha <= 0) {
        clearInterval(fadeInterval);
        ray.dispose();
      }
    }, 50);

    // Partículas en el punto de impacto
    const particles = new BABYLON.ParticleSystem(`particles_${Date.now()}`, 50, scene);
    particles.particleTexture = new BABYLON.Texture('/particle.png', scene);
    particles.emitter = planet.position.clone();
    particles.minLifeTime = 0.3;
    particles.maxLifeTime = 0.6;
    particles.minSize = 0.2;
    particles.maxSize = 0.5;
    particles.emitRate = 100;
    particles.color1 = new BABYLON.Color4(0.2, 1, 0.5, 1);
    particles.color2 = new BABYLON.Color4(1, 1, 0.5, 1);
    particles.minEmitPower = 1;
    particles.maxEmitPower = 3;
    particles.updateSpeed = 0.02;
    
    particles.start();
    setTimeout(() => {
      particles.stop();
      setTimeout(() => particles.dispose(), 1000);
    }, 200);

  }, []);

  // Efecto de rayos cuando hay nuevas decisiones
  useEffect(() => {
    if (recentDecisions.length > 0) {
      const latestDecision = recentDecisions[0];
      const project = projects.find(p => p.name === latestDecision.projectName);
      if (project) {
        createTransactionRay(project.id, latestDecision.revenue);
      }
    }
  }, [recentDecisions, projects, createTransactionRay]);

  // Inicializar motor y escena
  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new BABYLON.Engine(canvasRef.current, true, {
      preserveDrawingBuffer: true,
      stencil: true
    });
    engineRef.current = engine;

    const scene = createScene(engine, canvasRef.current);
    sceneRef.current = scene;

    engine.runRenderLoop(() => {
      scene.render();
    });

    const handleResize = () => {
      engine.resize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      scene.dispose();
      engine.dispose();
    };
  }, [createScene]);

  // Actualizar planetas cuando cambian los datos
  useEffect(() => {
    planetsRef.current.forEach((planet, projectId) => {
      const project = projects.find(p => p.id === projectId);
      if (project && planet.metadata) {
        planet.metadata.activity = project.transactionsPerHour;
        planet.metadata.revenue = project.totalRevenue;
        
        // Actualizar color si el modo cambió
        const planetMat = planet.material as BABYLON.StandardMaterial;
        if (project.agentMode === 'paused') {
          planetMat.diffuseColor = new BABYLON.Color3(0.4, 0.4, 0.4);
          planetMat.emissiveColor = new BABYLON.Color3(0.2, 0.2, 0.2);
        } else if (planet.metadata.baseColor) {
          planetMat.diffuseColor = planet.metadata.baseColor;
          planetMat.emissiveColor = planet.metadata.baseColor.scale(0.4);
        }
      }
    });
  }, [projects]);

  return (
    <div className="relative w-full h-full">
      <canvas 
        ref={canvasRef} 
        className="w-full h-full outline-none"
        style={{ touchAction: 'none' }}
      />
      
      {/* Overlay de información del planeta seleccionado */}
      {selectedPlanet && (
        <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-4 max-w-xs">
          {(() => {
            const project = projects.find(p => p.id === selectedPlanet);
            if (!project) return null;
            return (
              <>
                <h3 className="text-lg font-bold text-cyan-400 mb-2">{project.name}</h3>
                <div className="space-y-1 text-sm">
                  <p className="text-slate-300">
                    <span className="text-slate-500">Ingresos totales:</span>{' '}
                    <span className="text-green-400">${project.totalRevenue.toLocaleString()}</span>
                  </p>
                  <p className="text-slate-300">
                    <span className="text-slate-500">Este mes:</span>{' '}
                    <span className="text-yellow-400">${project.monthlyRevenue.toLocaleString()}</span>
                  </p>
                  <p className="text-slate-300">
                    <span className="text-slate-500">Transacciones/hora:</span>{' '}
                    <span className="text-cyan-400">{project.transactionsPerHour.toFixed(1)}</span>
                  </p>
                  <p className="text-slate-300">
                    <span className="text-slate-500">Modo:</span>{' '}
                    <span className={
                      project.agentMode === 'auto' ? 'text-green-400' :
                      project.agentMode === 'paused' ? 'text-red-400' : 'text-yellow-400'
                    }>
                      {project.agentMode.toUpperCase()}
                    </span>
                  </p>
                </div>
                <button
                  onClick={() => setSelectedPlanet(null)}
                  className="mt-3 text-xs text-slate-500 hover:text-slate-300"
                >
                  Cerrar
                </button>
              </>
            );
          })()}
        </div>
      )}

      {/* Leyenda */}
      <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm border border-slate-700/50 rounded-lg p-3 text-xs">
        <p className="text-slate-400 mb-2 font-medium">SISTEMA SOLAR LEVIATHAN</p>
        <div className="space-y-1">
          <p className="text-yellow-400">☀️ Sol = Tu Liquidez Total</p>
          <p className="text-cyan-400">🌍 Planetas = Proyectos</p>
          <p className="text-green-400">⚡ Rayos = Transacciones</p>
        </div>
      </div>
    </div>
  );
}
