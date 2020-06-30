import * as THREE from "three";
import { createDisplacementGeometry } from "./displacementGeometry";

export function backgroundTerrainMesh(mapWidth, mapHeight, map) {
  const geometry = new THREE.PlaneBufferGeometry(mapWidth, mapHeight, 4, 4);
  const material = new THREE.MeshLambertMaterial({
    map,
    transparent: true,
    opacity: 0.5,
    toneMapped: false,
  });
  const plane = new THREE.Mesh(geometry, material);
  plane.scale.x = 10;
  plane.scale.y = 10;
  plane.rotation.x = -Math.PI / 2;

  plane.position.z = 32;
  plane.material.map.anisotropy = 1;
  plane.name = "backing-floor";
  return plane;
}

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
    // displacementScale: 6, // use it for reference, not for deformation since we already generated the mesh
    // bumpMap: map,
    // bumpScale: 0.1,
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
  plane.material.map.anisotropy = 16;
  plane.name = "floor";
  plane.userData.displacementMap = displace;
  plane.userData.displacementScale = displacementScale;
  return plane;
}
