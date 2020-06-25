import * as THREE from "three";

export function generateTerrainMesh(
  renderer,
  mapWidth,
  mapHeight,
  map,
  bg,
  displace,
  rough
) {
  const floor = (function () {
    const geometry = new THREE.PlaneGeometry(
      mapWidth,
      mapHeight,
      mapWidth * 2,
      mapHeight * 2
    );

    const material = new THREE.MeshStandardMaterial({
      map: map,
      displacementMap: displace,
      displacementScale: 6,
      bumpMap: map,
      bumpScale: 0.2,
      // normalMap: normal,
      // normalScale: new THREE.Vector2(1.3, 1.6),
      // normalMapType: THREE.TangentSpaceNormalMap,
      dithering: true,
      roughness: 1,
      roughnessMap: rough,
      envMap: THREE.WebGLCubeRenderTarget(renderer, map),
    });
    const plane = new THREE.Mesh(geometry, material);
    plane.rotation.x = -Math.PI / 2;

    plane.castShadow = true;
    plane.receiveShadow = true;
    plane.material.map.anisotropy = 16;
    plane.name = "floor";
    return plane;
  })();

  const backingFloor = (function () {
    const geometry = new THREE.PlaneBufferGeometry(mapWidth, mapHeight, 4, 4);
    const material = new THREE.MeshLambertMaterial({
      map: bg,
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
  })();

  return [floor, backingFloor];
}
