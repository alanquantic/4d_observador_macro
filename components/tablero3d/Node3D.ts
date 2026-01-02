
import * as BABYLON from '@babylonjs/core';

export interface NodeData {
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

export class Node3D {
  static create(
    scene: BABYLON.Scene,
    nodeData: NodeData,
    shadowGenerator: BABYLON.ShadowGenerator
  ): BABYLON.Mesh {
    // Crear esfera 3D
    const sphere = BABYLON.MeshBuilder.CreateSphere(
      nodeData.id,
      {
        diameter: nodeData.size,
        segments: 32,
      },
      scene
    );

    // Posición con eje Z real (Y es altura en Babylon.js)
    sphere.position = new BABYLON.Vector3(nodeData.x, nodeData.z, nodeData.y);
    
    // Configurar recepción de sombras más visible
    sphere.receiveShadows = false; // Los nodos no reciben sombras, solo las proyectan

    // Material con glow
    const material = new BABYLON.StandardMaterial(`${nodeData.id}_mat`, scene);
    const color = BABYLON.Color3.FromHexString(nodeData.color);
    
    material.diffuseColor = color;
    material.emissiveColor = color.scale(0.4);
    material.specularColor = new BABYLON.Color3(1, 1, 1);
    material.specularPower = 32;
    material.alpha = 0.95;

    sphere.material = material;

    // Habilitar sombras
    shadowGenerator.addShadowCaster(sphere);
    sphere.receiveShadows = true;

    // Halo glow (outer glow)
    const glow = BABYLON.MeshBuilder.CreateSphere(
      `${nodeData.id}_glow`,
      {
        diameter: nodeData.size * 1.5,
        segments: 16,
      },
      scene
    );
    glow.position = sphere.position.clone();
    
    const glowMat = new BABYLON.StandardMaterial(`${nodeData.id}_glow_mat`, scene);
    glowMat.emissiveColor = color;
    glowMat.alpha = 0.15;
    glowMat.alphaMode = BABYLON.Engine.ALPHA_ADD;
    glow.material = glowMat;

    // Anillo interno (core)
    const core = BABYLON.MeshBuilder.CreateSphere(
      `${nodeData.id}_core`,
      {
        diameter: nodeData.size * 0.4,
        segments: 16,
      },
      scene
    );
    core.position = sphere.position.clone();
    
    const coreMat = new BABYLON.StandardMaterial(`${nodeData.id}_core_mat`, scene);
    coreMat.emissiveColor = new BABYLON.Color3(1, 1, 1);
    coreMat.alpha = 0.9;
    core.material = coreMat;

    // Animación sutil (vibración 4D)
    let time = Math.random() * Math.PI * 2;
    scene.registerBeforeRender(() => {
      time += 0.01;
      
      // Vibración en Y (altura)
      const vibration = Math.sin(time * 2) * 0.05 * nodeData.energy;
      sphere.position.y = nodeData.z + vibration;
      glow.position.y = sphere.position.y;
      core.position.y = sphere.position.y;
      
      // Pulsación del glow
      const pulse = 1 + Math.sin(time) * 0.1;
      glow.scaling.setAll(pulse);
      
      // Variación de intensidad del core
      const coreIntensity = 0.7 + Math.sin(time * 3) * 0.3;
      coreMat.emissiveColor = new BABYLON.Color3(coreIntensity, coreIntensity, coreIntensity);
    });

    return sphere;
  }
}
