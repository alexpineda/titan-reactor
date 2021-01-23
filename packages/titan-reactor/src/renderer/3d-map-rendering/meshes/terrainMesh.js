import * as THREE from "three";
import { createDisplacementGeometry } from "../displacementGeometry";

export function terrainMesh(
  mapWidth,
  mapHeight,
  map,
  displace,
  rough,
  normal,
  displacementScale = 6
) {
  const geometry = createDisplacementGeometry(
    null,
    mapWidth,
    mapHeight,
    mapWidth * 2,
    mapHeight * 2,
    displace.image,
    displacementScale,
    0
  );

  const material = new THREE.MeshStandardMaterial({
    map: map,
    bumpMap: map,
    bumpScale: 0.3,
    // normalMap: normal,
    // normalScale: new THREE.Vector2(1.3, 1.6),
    // normalMapType: THREE.TangentSpaceNormalMap,
    dithering: true,
    roughness: 1,
    roughnessMap: rough,
  });

  const plane = new THREE.Mesh(geometry, material);
  plane.rotation.x = -Math.PI / 2;

  plane.castShadow = true;
  plane.receiveShadow = true;
  plane.userData.displacementMap = displace;
  plane.userData.displacementScale = displacementScale;
  plane.name = "terrainMesh";
  return plane;
}
