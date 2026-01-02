
import * as BABYLON from '@babylonjs/core';

export class Grid3D {
  static create(scene: BABYLON.Scene): void {
    // Plano base 3D para el grid (MUCHO más grande para ver las sombras)
    const ground = BABYLON.MeshBuilder.CreateGround(
      'ground',
      {
        width: 200,
        height: 200,
        subdivisions: 80,
      },
      scene
    );
    ground.position.y = -5; // Más abajo para que las sombras se vean claramente
    ground.receiveShadows = true; // CRÍTICO: recibe las sombras de los nodos

    // Shader holográfico personalizado
    const groundMat = new BABYLON.StandardMaterial('groundMat', scene);
    groundMat.diffuseColor = new BABYLON.Color3(0.02, 0.05, 0.15);
    groundMat.emissiveColor = new BABYLON.Color3(0.05, 0.15, 0.25);
    groundMat.alpha = 0.8;
    groundMat.backFaceCulling = false;
    
    ground.material = groundMat;

    // Grid lines holográficas
    const gridSize = 100;
    const divisions = 20;
    const step = gridSize / divisions;

    for (let i = -divisions / 2; i <= divisions / 2; i++) {
      // Líneas en X
      const lineX = BABYLON.MeshBuilder.CreateLines(
        `gridX_${i}`,
        {
          points: [
            new BABYLON.Vector3(-gridSize / 2, -4.5, i * step),
            new BABYLON.Vector3(gridSize / 2, -4.5, i * step),
          ],
        },
        scene
      );
      lineX.color = new BABYLON.Color3(0.1, 0.4, 0.6);
      lineX.alpha = 0.4;

      // Líneas en Z
      const lineZ = BABYLON.MeshBuilder.CreateLines(
        `gridZ_${i}`,
        {
          points: [
            new BABYLON.Vector3(i * step, -4.5, -gridSize / 2),
            new BABYLON.Vector3(i * step, -4.5, gridSize / 2),
          ],
        },
        scene
      );
      lineZ.color = new BABYLON.Color3(0.1, 0.4, 0.6);
      lineZ.alpha = 0.4;
    }

    // Anillos territoriales concéntricos
    for (let r = 10; r <= 40; r += 10) {
      const ring = BABYLON.MeshBuilder.CreateTorus(
        `ring_${r}`,
        {
          diameter: r * 2,
          thickness: 0.08,
          tessellation: 64,
        },
        scene
      );
      ring.position.y = -4.3;
      ring.rotation.x = Math.PI / 2;

      const ringMat = new BABYLON.StandardMaterial(`ring_mat_${r}`, scene);
      ringMat.emissiveColor = new BABYLON.Color3(0, 0.8, 1);
      ringMat.alpha = 0.2 - (r / 40) * 0.15;
      ringMat.alphaMode = BABYLON.Engine.ALPHA_ADD;
      ring.material = ringMat;
    }

    // Animación de deformación sutil
    let time = 0;
    scene.registerBeforeRender(() => {
      time += 0.01;
      
      // Deformación holográfica del plano
      const positions = ground.getVerticesData(BABYLON.VertexBuffer.PositionKind);
      if (positions) {
        for (let i = 0; i < positions.length; i += 3) {
          const x = positions[i];
          const z = positions[i + 2];
          const distance = Math.sqrt(x * x + z * z);
          
          // Ondulación desde el centro
          positions[i + 1] = Math.sin(distance * 0.1 - time) * 0.3;
        }
        ground.updateVerticesData(BABYLON.VertexBuffer.PositionKind, positions);
      }
    });
  }
}
