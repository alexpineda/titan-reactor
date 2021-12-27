import { WrappedTexture } from "common";
import {
  MeshBasicMaterial,
  OrthographicCamera,
  Scene,
  Vector3,
  PlaneBufferGeometry,
  Mesh,
  CanvasTexture,
  sRGBEncoding,
  WebGLRenderer,
} from "three";
import { parseDdsGrp } from "../../formats/parse-dds-grp";

import { loadHdTile, PX_PER_TILE_HD } from "./common";

const width = 13;
const height = 1;

// generates a single creep texture from 0 - 13
export const ddsToCreepTexture = (buffer: Buffer, tilegroupU16: Uint16Array): WrappedTexture => {
  const renderer = new WebGLRenderer({
    depth: false,
    stencil: false,
    alpha: true,
  });
  renderer.autoClear = false;

  const hdTiles = parseDdsGrp(buffer);

  const ortho = new OrthographicCamera(
    -width / 2,
    width / 2,
    -height / 2,
    height / 2
  );
  ortho.position.y = width;
  ortho.lookAt(new Vector3());

  renderer.setSize(width * PX_PER_TILE_HD, height * PX_PER_TILE_HD);

  const scene = new Scene();
  const plane = new PlaneBufferGeometry();
  const mat = new MeshBasicMaterial({});
  const mesh = new Mesh(plane, mat);
  mesh.rotation.x = Math.PI / 2;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not create canvas context");
  }
  canvas.width = width * PX_PER_TILE_HD;
  canvas.height = height * PX_PER_TILE_HD;

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
  renderer.dispose();

  return { texture, width: width * PX_PER_TILE_HD, height: height * PX_PER_TILE_HD };
};
