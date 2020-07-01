import * as THREE from "three";

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
