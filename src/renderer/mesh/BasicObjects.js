import { MeshBasicMaterial, CircleGeometry, Mesh } from "three";

export function createStartLocation(mapX, mapY, color, mapZ = 0) {
  var geometry = new CircleGeometry(2, 32);
  var material = new MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.5,
  });
  var circle = new Mesh(geometry, material);
  circle.rotation.x = Math.PI / -2;
  circle.position.x = mapX;
  circle.position.z = mapY;
  circle.position.y = mapZ;
  circle.name = "StartPosition";
  return circle;
}
