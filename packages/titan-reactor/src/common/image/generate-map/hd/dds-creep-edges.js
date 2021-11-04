import {
  MeshBasicMaterial,
  OrthographicCamera,
  Scene,
  Vector3,
  PlaneBufferGeometry,
  Mesh,
  CanvasTexture,
  sRGBEncoding,
  DoubleSide,
} from "three";

import { loadHdTile, PX_PER_TILE } from "./common";

// generates a single creep texture for the edges from 0 - 15
export const ddsToCreepEdgesTexture = (renderer, creepGrp) => {
  const bottomEdges = [0, 1, 2, 3];
  const rightEdges = [4];
  const topEdges = [6, 11, 17, 21];
  const leftEdges = [15];

  const getOffset = (grp, tileId) => {
    const x = 0.5;
    const y = 0.5;

    if (topEdges.includes(tileId)) {
      return {
        x,
        y: grp.h / 256,
      };
    }

    if (bottomEdges.includes(tileId)) {
      return {
        x,
        y: 1 - grp.h / 256,
      };
    }

    if (leftEdges.includes(tileId)) {
      return {
        y,
        x: 1 - grp.w / 256,
      };
    }

    if (rightEdges.includes(tileId)) {
      return {
        y,
        x: grp.w / 256,
      };
    }

    return {
      x,
      y,
    };
  };

  const width = 37;
  const height = 1;
  const ortho = new OrthographicCamera(
    -width / 2,
    width / 2,
    -height / 2,
    height / 2
  );
  ortho.position.y = width;
  ortho.lookAt(new Vector3());

  renderer.setSize(width * PX_PER_TILE, height * PX_PER_TILE);

  const scene = new Scene();
  const plane = new PlaneBufferGeometry();
  const mat = new MeshBasicMaterial({});
  const mesh = new Mesh(plane, mat);
  mesh.rotation.x = Math.PI / 2;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = width * PX_PER_TILE;
  canvas.height = height * PX_PER_TILE;

  for (let i = 0; i < creepGrp.length; i++) {
    const x = i;
    const y = 0;
    const grp = creepGrp[i];
    const texture = loadHdTile(grp.dds);

    mat.map = texture;
    mat.needsUpdate = true;
    mat.side = DoubleSide;
    mesh.scale.set(grp.w / PX_PER_TILE, grp.h / PX_PER_TILE, 1);
    mesh.position.x = x - width / 2 + getOffset(grp, i).x;
    // if (x >= 1 && x <= 4) {
    //   mesh.position.z = y - height / 2 + 1;
    // } else {
    mesh.position.z = y - height / 2 + getOffset(grp, i).y;
    // }
    mesh.rotation.z = Math.PI;
    mesh.rotation.y = Math.PI;
    scene.add(mesh);
    renderer.render(scene, ortho);
    scene.remove(mesh);
  }

  ctx.drawImage(renderer.domElement, 0, 0);
  const texture = new CanvasTexture(canvas);
  texture.encoding = sRGBEncoding;
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  // texture.flipY = true;

  mat.dispose();

  return { texture, width: width * PX_PER_TILE, height: height * PX_PER_TILE };
};