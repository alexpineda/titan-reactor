import {
  MeshBasicMaterial,
  OrthographicCamera,
  Scene,
  Vector3,
  PlaneBufferGeometry,
  Mesh,
  CanvasTexture,
  sRGBEncoding,
} from "three";

import { loadHdTile, PX_PER_TILE_HD } from "./common";

//TODO: INCOMPLETE
export const ddsToWarpInTexture = function (renderer, warpIn) {
  const width = 5;
  const height = 5;
  const ortho = new OrthographicCamera(
    -width / 2,
    width / 2,
    -height / 2,
    height / 2
  );
  ortho.position.y = width;
  ortho.lookAt(new Vector3());

  renderer.setSize(width * 768, height * 768);

  const scene = new Scene();
  const plane = new PlaneBufferGeometry();
  const mat = new MeshBasicMaterial({});
  const mesh = new Mesh(plane, mat);
  mesh.rotation.x = Math.PI / 2;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = width * 128;
  canvas.height = height * 128;

  for (let i = 0; i < width; i++) {
    const x = i;
    const y = 0;
    // get the 13 creep tiles in the 2nd tile group including a first empty tile
    const texture = loadHdTile(hdTiles[tilegroupU16[36 + i]]);

    mat.map = texture;
    mat.needsUpdate = true;
    mesh.position.x = x - width / 2 + 0.5;
    mesh.position.z = y - height / 2 + 0.5;
    scene.add(mesh);
    renderer.render(scene, ortho);
    scene.remove(mesh);
  }

  ctx.drawImage(renderer.domElement, 0, 0);
  const texture = new CanvasTexture(canvas);
  texture.encoding = sRGBEncoding;
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  texture.flipY = true;

  mat.dispose();

  return { texture, width: width * 128, height: height * 128 };
};
