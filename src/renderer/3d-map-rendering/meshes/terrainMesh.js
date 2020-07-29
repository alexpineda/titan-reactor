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

  // const geometry = new THREE.PlaneBufferGeometry(
  //   mapWidth,
  //   mapHeight,
  //   mapWidth * 2,
  //   mapHeight * 2
  // );
  const material = new THREE.MeshStandardMaterial({
    map: map,
    // displacementMap: displace,
    // displacementScale: 0.5, // use it for reference, not for deformation since we already generated the mesh
    // bumpMap: map,
    // bumpScale: 0.1,
    // normalMap: normal,
    normalScale: new THREE.Vector2(1.3, 1.6),
    normalMapType: THREE.TangentSpaceNormalMap,
    dithering: true,
    roughness: 1,
    roughnessMap: rough,
  });

  const plane = new THREE.Mesh(geometry, material);
  plane.rotation.x = -Math.PI / 2;

  plane.castShadow = true;
  plane.receiveShadow = true;
  plane.material.map.anisotropy = 16;
  plane.userData.displacementMap = displace;
  plane.userData.displacementScale = displacementScale;
  plane.name = "terrainMesh";
  return plane;
}
