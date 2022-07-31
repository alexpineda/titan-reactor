import { DDSGrpFrameType, WrappedTexture, UnitTileScale } from "common/types";
import {
  CanvasTexture, DoubleSide, Mesh, MeshBasicMaterial, NearestFilter, OrthographicCamera, PlaneBufferGeometry, Scene, sRGBEncoding, Vector3, WebGLRenderer
} from "three";
import { parseDdsGrpWithFrameData } from "../../formats/parse-dds-grp";

import { createCompressedTexture } from "./common";

const bottomEdges = [0, 1, 2, 3];
const rightEdges = [4];
const topEdges = [6, 11, 17, 21];
const leftEdges = [15];

// generates a single creep texture for the edges from 0 - 15
export const ddsToCreepEdgesTexture = (buffer: Buffer, res: UnitTileScale): WrappedTexture => {
  const renderer = new WebGLRenderer({
    depth: false,
    stencil: false,
    antialias: false,
    alpha: true,
    precision: "highp",
  });
  renderer.autoClear = false;
  const PX_PER_TILE_HD = res === UnitTileScale.HD ? 128 : 64;
  const edgeScale = res === UnitTileScale.HD ? 256 : 128;

  const creepGrp = parseDdsGrpWithFrameData(buffer);

  const getOffset = (grp: DDSGrpFrameType, tileId: number) => {
    const x = 0.5;
    const y = 0.5;

    if (topEdges.includes(tileId)) {
      return {
        x,
        y: grp.h / edgeScale,
      };
    }

    if (bottomEdges.includes(tileId)) {
      return {
        x,
        y: 1 - grp.h / edgeScale,
      };
    }

    if (leftEdges.includes(tileId)) {
      return {
        y,
        x: 1 - grp.w / edgeScale,
      };
    }

    if (rightEdges.includes(tileId)) {
      return {
        y,
        x: grp.w / edgeScale,
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

  renderer.setSize(width * PX_PER_TILE_HD, height * PX_PER_TILE_HD);

  const scene = new Scene();
  const plane = new PlaneBufferGeometry();
  const mat = new MeshBasicMaterial({
    transparent: true,
  });

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not create canvas context");
  }
  canvas.width = width * PX_PER_TILE_HD;
  canvas.height = height * PX_PER_TILE_HD;

  const mesh = new Mesh(plane, mat);
  mesh.rotation.x = Math.PI / 2;

  for (let i = 0; i < creepGrp.length; i++) {
    const x = i;
    const y = 0;
    const grp = creepGrp[i];
    const texture = createCompressedTexture(grp.dds);

    mat.map = texture;
    mat.needsUpdate = true;
    mat.side = DoubleSide;
    mesh.scale.set(grp.w / PX_PER_TILE_HD, grp.h / PX_PER_TILE_HD, 1);
    mesh.position.x = x - width / 2 + getOffset(grp, i).x;
    mesh.position.z = y - height / 2 + getOffset(grp, i).y;
    mesh.rotation.z = Math.PI;
    mesh.rotation.y = Math.PI;
    scene.add(mesh);
    renderer.render(scene, ortho);
    scene.remove(mesh);
  }

  // ctx.drawImage(renderer.domElement, 0, 0);
  const texture = new CanvasTexture(renderer.domElement);
  texture.encoding = sRGBEncoding;
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  texture.minFilter = NearestFilter;
  texture.magFilter = NearestFilter;


  mat.dispose();
  renderer.dispose();

  return { texture, width: width * PX_PER_TILE_HD, height: height * PX_PER_TILE_HD, pxPerTile: PX_PER_TILE_HD };
};
