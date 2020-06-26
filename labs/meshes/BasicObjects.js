import * as THREE from "three";
import { easeExpOut } from "d3-ease";

export function createGuyser(mapX, mapY) {
  const geo = new THREE.BoxGeometry(1, 1, 0.5);
  geo.translate(0, 0.5, 0);
  const mat = new MeshBasicMaterial({
    color: 0x00ff00,
  });
  const mes = new THREE.Mesh(geo, mat);
  mes.position.x = mapX;
  mes.position.z = mapY;
  return mes;
}

export function createMineral(mapX, mapY) {
  const geo = new THREE.BoxGeometry(1, 1, 0.5);
  geo.translate(0, 0.5, 0);
  const mat = new THREE.MeshBasicMaterial({
    color: 0x0000ff,
  });
  const mes = new THREE.Mesh(geo, mat);
  mes.position.x = mapX;
  mes.position.z = mapY;
  return mes;
}

export function createStartLocation(mapX, mapY, color) {
  var geometry = new THREE.CircleGeometry(2, 32);
  var material = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.5,
  });
  var circle = new THREE.Mesh(geometry, material);
  circle.rotation.x = Math.PI / -2;
  circle.position.x = mapX;
  circle.position.z = mapY;
  circle.position.y = 0.01;
  circle.name = "StartPosition";
  return circle;
}

export function createFadingPointer(x, y, color, time) {
  const geo = new THREE.ConeGeometry(0.5, 1, 5);
  geo.rotateX(Math.PI);
  geo.translate(0, 0.5, 0);
  const mat = new THREE.MeshBasicMaterial({
    color,
  });
  mat.transparent = true;
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.x = x;
  mesh.position.z = y;
  mesh.name = "FadingPointer";

  mesh.userData = {
    time,
  };
  return mesh;
}

export function updateFadingPointers(pointersParent, time) {
  const lifeSpan = 10;
  pointersParent.children
    .filter((c) => c.name == "FadingPointer" && c.visible)
    .forEach((o) => {
      try {
        const opacity = easeExpOut(1 - (time - o.userData.time) / lifeSpan);
        o.material.opacity = opacity;
      } catch (e) {}
      if (time - o.userData.time > lifeSpan) {
        o.visible = false;
      }
    });
}

export function createMiniMapPlane(width, height) {
  const geo = new THREE.PlaneBufferGeometry(width, height, width, height);
  const mat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
  });
  var mesh = new THREE.Mesh(geo, mat);
  mesh.rotateX(-0.5 * Math.PI);
  return mesh;
}
