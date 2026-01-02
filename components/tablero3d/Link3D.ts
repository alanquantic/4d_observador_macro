
import * as BABYLON from '@babylonjs/core';

interface NodeData {
  x: number;
  y: number;
  z: number;
}

interface LinkData {
  strength: number;
}

export class Link3D {
  static create(
    scene: BABYLON.Scene,
    sourceNode: NodeData,
    targetNode: NodeData,
    linkData: LinkData
  ): BABYLON.Mesh {
    // Crear puntos para el tubo 3D
    const path = [
      new BABYLON.Vector3(sourceNode.x, sourceNode.z, sourceNode.y),
      new BABYLON.Vector3(targetNode.x, targetNode.z, targetNode.y),
    ];

    // Crear tubo 3D con volumen
    const tube = BABYLON.MeshBuilder.CreateTube(
      `link_${Math.random()}`,
      {
        path: path,
        radius: 0.08 * linkData.strength,
        cap: BABYLON.Mesh.CAP_ALL,
        tessellation: 16,
      },
      scene
    );

    // Material con transparencia y glow
    const material = new BABYLON.StandardMaterial(`link_mat_${Math.random()}`, scene);
    material.emissiveColor = new BABYLON.Color3(0.3, 0.8, 1);
    material.alpha = 0.4 + linkData.strength * 0.3;
    material.alphaMode = BABYLON.Engine.ALPHA_ADD;

    tube.material = material;

    // Animación de flujo
    let time = 0;
    scene.registerBeforeRender(() => {
      time += 0.02;
      
      // Pulso de energía
      const pulse = 0.6 + Math.sin(time * 2) * 0.4;
      material.alpha = (0.4 + linkData.strength * 0.3) * pulse;
      
      // Cambio sutil de color
      const hue = 0.5 + Math.sin(time) * 0.1;
      material.emissiveColor = new BABYLON.Color3(hue * 0.3, hue * 0.8, 1);
    });

    return tube;
  }
}
