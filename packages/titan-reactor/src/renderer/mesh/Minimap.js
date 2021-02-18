import { Mesh, MeshBasicMaterial, PlaneBufferGeometry } from "three";
import { MinimapLayer, MinimapUnitLayer } from "../camera/Layers";

export const createMiniMapPlane = (map, mapWidth, mapHeight) => {
  const geo = new PlaneBufferGeometry(
    mapWidth,
    mapHeight,
    Math.floor(mapWidth / 32),
    Math.floor(mapHeight / 32)
  );
  const mat = new MeshBasicMaterial({
    color: 0xffffff,
    map,
  });
  var mesh = new Mesh(geo, mat);
  mesh.rotateX(-0.5 * Math.PI);
  mesh.layers.set(MinimapLayer);
  return mesh;
};

export const createMinimapPoint = (color, w, h) => {
  const geometry = new PlaneBufferGeometry(w, h);
  const material = new MeshBasicMaterial({ color });
  const plane = new Mesh(geometry, material);
  plane.rotation.x = -Math.PI / 2;
  plane.layers.set(MinimapUnitLayer);
  plane.name = "MinimapPoint";
  return plane;
};
