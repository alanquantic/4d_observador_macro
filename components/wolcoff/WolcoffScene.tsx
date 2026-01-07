'use client';

import { useEffect, useRef } from 'react';
import * as BABYLON from '@babylonjs/core';
import { getWolcoffDistortion, getWolcoffColor } from '@/lib/nodeInterpreter';

interface WolcoffSceneProps {
  coherence: number;
  energy: number;
}

export default function WolcoffScene({ coherence, energy }: WolcoffSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<BABYLON.Engine | null>(null);
  const sphereRef = useRef<BABYLON.Mesh | null>(null);
  const glowRef = useRef<BABYLON.Mesh | null>(null);
  const coreRef = useRef<BABYLON.Mesh | null>(null);
  const materialRef = useRef<BABYLON.StandardMaterial | null>(null);
  const glowMatRef = useRef<BABYLON.StandardMaterial | null>(null);
  const coreMatRef = useRef<BABYLON.StandardMaterial | null>(null);

  // Actualizar materiales y coherencia cuando cambian los props
  useEffect(() => {
    // Actualizar coherencia para la animación
    if ((window as any).__updateWolcoffCoherence) {
      (window as any).__updateWolcoffCoherence(coherence);
    }

    if (!materialRef.current) return;

    const wolcoffColorHex = getWolcoffColor(coherence);
    const color = BABYLON.Color3.FromHexString(wolcoffColorHex);

    materialRef.current.diffuseColor = color;
    materialRef.current.emissiveColor = color.scale(0.4);

    if (glowMatRef.current) {
      glowMatRef.current.emissiveColor = color;
    }
  }, [coherence]);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Crear engine
    const engine = new BABYLON.Engine(canvasRef.current, true, {
      preserveDrawingBuffer: true,
      stencil: true,
    });
    engineRef.current = engine;

    // Crear escena
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color4(0.01, 0.02, 0.05, 1);

    // Cámara orbital
    const camera = new BABYLON.ArcRotateCamera(
      'camera',
      Math.PI / 4,
      Math.PI / 2.5,
      8,
      new BABYLON.Vector3(0, 0, 0),
      scene
    );
    camera.lowerRadiusLimit = 4;
    camera.upperRadiusLimit = 15;
    camera.attachControl(canvasRef.current, true);
    camera.wheelPrecision = 20;
    camera.panningSensibility = 0;

    // Luces
    const ambientLight = new BABYLON.HemisphericLight(
      'ambient',
      new BABYLON.Vector3(0, 1, 0),
      scene
    );
    ambientLight.intensity = 0.4;
    ambientLight.diffuse = new BABYLON.Color3(0.8, 0.9, 1);
    ambientLight.groundColor = new BABYLON.Color3(0.1, 0.1, 0.2);

    const mainLight = new BABYLON.PointLight(
      'main',
      new BABYLON.Vector3(5, 5, 5),
      scene
    );
    mainLight.intensity = 1.2;

    const backLight = new BABYLON.PointLight(
      'back',
      new BABYLON.Vector3(-5, -3, -5),
      scene
    );
    backLight.intensity = 0.5;
    backLight.diffuse = new BABYLON.Color3(0.5, 0.3, 1);

    // Crear esfera principal
    const sphere = BABYLON.MeshBuilder.CreateSphere(
      'wolcoff',
      { diameter: 2, segments: 64 },
      scene
    );
    sphereRef.current = sphere;

    // Material principal
    const material = new BABYLON.StandardMaterial('wolcoff_mat', scene);
    const initialColor = BABYLON.Color3.FromHexString(getWolcoffColor(coherence));
    material.diffuseColor = initialColor;
    material.emissiveColor = initialColor.scale(0.4);
    material.specularColor = new BABYLON.Color3(1, 1, 1);
    material.specularPower = 64;
    material.alpha = 0.95;
    sphere.material = material;
    materialRef.current = material;

    // Glow externo
    const glow = BABYLON.MeshBuilder.CreateSphere(
      'glow',
      { diameter: 3, segments: 32 },
      scene
    );
    glowRef.current = glow;

    const glowMat = new BABYLON.StandardMaterial('glow_mat', scene);
    glowMat.emissiveColor = initialColor;
    glowMat.alpha = 0.1;
    glowMat.alphaMode = BABYLON.Engine.ALPHA_ADD;
    glow.material = glowMat;
    glowMatRef.current = glowMat;

    // Core interno
    const core = BABYLON.MeshBuilder.CreateSphere(
      'core',
      { diameter: 0.6, segments: 32 },
      scene
    );
    coreRef.current = core;

    const coreMat = new BABYLON.StandardMaterial('core_mat', scene);
    coreMat.emissiveColor = new BABYLON.Color3(1, 1, 1);
    coreMat.alpha = 0.95;
    core.material = coreMat;
    coreMatRef.current = coreMat;

    // Grid de fondo
    const gridSize = 30;
    const gridDivisions = 30;
    for (let i = -gridDivisions / 2; i <= gridDivisions / 2; i++) {
      const step = gridSize / gridDivisions;
      
      // Líneas X
      const lineX = BABYLON.MeshBuilder.CreateLines(
        `gridX_${i}`,
        {
          points: [
            new BABYLON.Vector3(-gridSize / 2, -4, i * step),
            new BABYLON.Vector3(gridSize / 2, -4, i * step),
          ],
        },
        scene
      );
      lineX.color = new BABYLON.Color3(0.1, 0.15, 0.3);
      lineX.alpha = 0.3;

      // Líneas Z
      const lineZ = BABYLON.MeshBuilder.CreateLines(
        `gridZ_${i}`,
        {
          points: [
            new BABYLON.Vector3(i * step, -4, -gridSize / 2),
            new BABYLON.Vector3(i * step, -4, gridSize / 2),
          ],
        },
        scene
      );
      lineZ.color = new BABYLON.Color3(0.1, 0.15, 0.3);
      lineZ.alpha = 0.3;
    }

    // Partículas ambientales
    const particles = new BABYLON.ParticleSystem('particles', 500, scene);
    particles.particleTexture = new BABYLON.Texture(
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAIklEQVQYV2NkYGD4z8DAwMgABXAGMgOpgRhgZIAAOAOZAQCn8AEL5C4AqAAAAABJRU5ErkJggg==',
      scene
    );
    particles.emitter = BABYLON.Vector3.Zero();
    particles.minEmitBox = new BABYLON.Vector3(-10, -5, -10);
    particles.maxEmitBox = new BABYLON.Vector3(10, 5, 10);
    particles.color1 = new BABYLON.Color4(0.3, 0.5, 1, 0.3);
    particles.color2 = new BABYLON.Color4(0.5, 0.3, 1, 0.2);
    particles.colorDead = new BABYLON.Color4(0, 0, 0, 0);
    particles.minSize = 0.05;
    particles.maxSize = 0.15;
    particles.minLifeTime = 3;
    particles.maxLifeTime = 6;
    particles.emitRate = 30;
    particles.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;
    particles.direction1 = new BABYLON.Vector3(-0.2, 0.3, -0.2);
    particles.direction2 = new BABYLON.Vector3(0.2, 0.5, 0.2);
    particles.minEmitPower = 0.1;
    particles.maxEmitPower = 0.3;
    particles.gravity = new BABYLON.Vector3(0, 0.05, 0);
    particles.start();

    // Animación con lógica Wolcoff
    let time = 0;
    const phase = Math.random() * Math.PI * 2;
    const phase2 = Math.random() * Math.PI * 2;
    const phase3 = Math.random() * Math.PI * 2;
    
    // Almacenar coherencia actual para animación
    let currentCoherence = coherence;

    // Función para actualizar coherencia desde fuera
    (window as any).__updateWolcoffCoherence = (newCoherence: number) => {
      currentCoherence = newCoherence;
    };

    scene.registerBeforeRender(() => {
      time += 0.015;
      const wolcoff = getWolcoffDistortion(currentCoherence);

      if (currentCoherence >= 0.8) {
        // FLUJO: Esfera perfecta
        sphere.scaling.setAll(1);
        sphere.rotation.y = time * 0.2;
        glow.scaling.setAll(1.5 + Math.sin(time * 0.5) * 0.05);
        if (glowMatRef.current) glowMatRef.current.alpha = 0.15;
        
      } else if (currentCoherence >= 0.6) {
        // EXPANSIÓN: Leve ondulación
        const scaleVar = wolcoff.scaleVariance * 0.5;
        sphere.scaling.x = 1 + Math.sin(time * 1.5 + phase) * scaleVar;
        sphere.scaling.y = 1 + Math.cos(time * 1.2 + phase2) * scaleVar * 0.8;
        sphere.scaling.z = 1 + Math.sin(time * 1.8 + phase3) * scaleVar * 0.6;
        sphere.rotation.y = time * 0.3;
        glow.scaling.setAll(1.5 + Math.sin(time) * 0.1);
        if (glowMatRef.current) glowMatRef.current.alpha = 0.12 + Math.sin(time * 1.5) * 0.03;
        
      } else if (currentCoherence >= 0.4) {
        // FRICCIÓN: Distorsión visible
        const scaleVar = wolcoff.scaleVariance;
        sphere.scaling.x = 1 + Math.sin(time * 3 + phase) * scaleVar;
        sphere.scaling.y = 1 + Math.cos(time * 2.5 + phase2) * scaleVar * 0.85;
        sphere.scaling.z = 1 + Math.sin(time * 3.5 + phase3) * scaleVar;
        sphere.rotation.y = time * 0.4;
        sphere.rotation.x = Math.sin(time * 2) * 0.05;
        glow.scaling.setAll(1.5 + Math.sin(time * 1.5) * 0.15);
        if (glowMatRef.current) glowMatRef.current.alpha = 0.1 + Math.sin(time * 3) * 0.05;
        
      } else if (currentCoherence >= 0.2) {
        // SATURACIÓN: Alta distorsión
        const scaleVar = wolcoff.scaleVariance * 1.2;
        sphere.scaling.x = 1 + Math.sin(time * 5 + phase) * scaleVar;
        sphere.scaling.y = 1 + Math.cos(time * 4 + phase2) * scaleVar * 0.9;
        sphere.scaling.z = 1 + Math.sin(time * 6 + phase3) * scaleVar * 1.1;
        sphere.rotation.y = time * 0.5;
        sphere.rotation.x = Math.sin(time * 3) * 0.1;
        sphere.rotation.z = Math.cos(time * 2.5) * 0.08;
        sphere.position.x = Math.sin(time * 4) * 0.05;
        sphere.position.z = Math.cos(time * 3.5) * 0.05;
        glow.scaling.setAll(1.5 + Math.sin(time * 2.5) * 0.2 + Math.random() * 0.05);
        if (glowMatRef.current) glowMatRef.current.alpha = 0.08 + Math.sin(time * 4) * 0.06;
        
      } else {
        // COLAPSO: Forma muy errática
        const scaleVar = wolcoff.scaleVariance * 1.5;
        sphere.scaling.x = 1 + Math.sin(time * 7 + phase) * scaleVar;
        sphere.scaling.y = 1 + Math.cos(time * 6 + phase2) * scaleVar * 0.8;
        sphere.scaling.z = 1 + Math.sin(time * 8 + phase3) * scaleVar * 1.2;
        sphere.rotation.y = time * 0.2;
        sphere.position.x = (Math.random() - 0.5) * 0.1;
        sphere.position.z = (Math.random() - 0.5) * 0.1;
        const spasm = Math.random() < 0.03 ? (Math.random() - 0.5) * 0.3 : 0;
        sphere.position.y = spasm;
        glow.scaling.setAll(1.5 + Math.random() * 0.2);
        if (glowMatRef.current) glowMatRef.current.alpha = 0.05 + Math.random() * 0.08;
      }

      // Sincronizar glow y core con esfera
      glow.position = sphere.position.clone();
      core.position = sphere.position.clone();

      // Core pulsante
      const coreIntensity = currentCoherence >= 0.5 
        ? 0.8 + Math.sin(time * 2) * 0.15
        : 0.5 + Math.sin(time * 4) * 0.3;
      if (coreMatRef.current) {
        coreMatRef.current.emissiveColor = new BABYLON.Color3(coreIntensity, coreIntensity, coreIntensity);
      }
    });

    // Render loop
    engine.runRenderLoop(() => {
      scene.render();
    });

    // Resize handler
    const handleResize = () => {
      engine.resize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      engine.dispose();
    };
  }, []); // Solo se ejecuta una vez al montar

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full outline-none"
      style={{ touchAction: 'none' }}
    />
  );
}

