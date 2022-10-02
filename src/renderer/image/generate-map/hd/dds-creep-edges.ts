import { Janitor } from "three-janitor";
import { DDSGrpFrameType, CreepTexture, UnitTileScale } from "common/types";
import {
  DoubleSide, Mesh, MeshBasicMaterial, NearestFilter, OrthographicCamera, PlaneBufferGeometry, Scene, sRGBEncoding, Vector3, WebGLRenderer, WebGLRenderTarget
} from "three";
import { parseDdsGrpWithFrameData } from "../../formats/parse-dds-grp";

import { createCompressedTexture } from "./common";
import { UTEX } from "@utils/UTEX";

const bottomEdges = [0, 1, 2, 3];
const rightEdges = [4];
const topEdges = [6, 11, 17, 21];
const leftEdges = [15];

// generates a single creep texture for the edges from 0 - 15
export const ddsToCreepEdgesTexture = (buffer: Buffer, res: UnitTileScale, renderer: WebGLRenderer): CreepTexture => {

  renderer.clear();

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

  const [renderWidth, renderHeight] = [width * PX_PER_TILE_HD, height * PX_PER_TILE_HD];

  const rt = new WebGLRenderTarget(renderWidth, renderHeight, {
    anisotropy: renderer.capabilities.getMaxAnisotropy(),
    encoding: sRGBEncoding,
    generateMipmaps: true,
    depthBuffer: false,
    minFilter: NearestFilter,
    magFilter: NearestFilter
  });
  renderer.setRenderTarget(rt)
  renderer.setSize(renderWidth, renderHeight);

  const scene = new Scene();
  scene.name = "creep-edges-ortho-scene";
  const plane = new PlaneBufferGeometry();

  for (let i = 0; i < creepGrp.length; i++) {
    const x = i;
    const y = 0;
    const grp = creepGrp[i];
    const texture = createCompressedTexture(grp.dds);
    texture.encoding = sRGBEncoding;

    const mesh = new Mesh(plane, new MeshBasicMaterial({
      transparent: true,
      map: texture,
      side: DoubleSide,
    }));
    mesh.name = `creep-edges-${i}`;
    mesh.rotation.x = Math.PI / 2;
    mesh.scale.set(grp.w / PX_PER_TILE_HD, grp.h / PX_PER_TILE_HD, 1);
    mesh.position.x = x - width / 2 + getOffset(grp, i).x;
    mesh.position.z = y - height / 2 + getOffset(grp, i).y;
    mesh.rotation.z = Math.PI;
    mesh.rotation.y = Math.PI;
    scene.add(mesh);
  }

  renderer.render(scene, ortho);
  renderer.setRenderTarget(null);

  const data = new Uint8Array(renderWidth * renderHeight * 4);
  renderer.readRenderTargetPixels(rt, 0, 0, renderWidth, renderHeight, data);
  const texture = createCompressedTexture(Buffer.from(UTEX.DDS.encode(data, renderWidth, renderHeight)));
  rt.dispose();

  texture.encoding = sRGBEncoding;
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  texture.minFilter = NearestFilter;
  texture.magFilter = NearestFilter;

  Janitor.trash("ddsCreep", scene);

  return { texture, count: width, dispose() { texture.dispose() } };

};
