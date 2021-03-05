import {
  MeshBasicMaterial,
  OrthographicCamera,
  Scene,
  Vector3,
  PlaneBufferGeometry,
  Mesh,
  CanvasTexture,
  CompressedTexture,
  LinearFilter,
  ClampToEdgeWrapping,
  sRGBEncoding,
  DoubleSide,
} from "three";

import { DDSLoader } from "titan-reactor-shared/image/DDSLoader";

const ddsLoader = new DDSLoader();

const loadDds = (buf) => {
  const hdTexture = new CompressedTexture();
  const texDatas = ddsLoader.parse(buf, false);

  hdTexture.mipmaps = texDatas.mipmaps;
  hdTexture.image.width = texDatas.width;
  hdTexture.image.height = texDatas.height;

  hdTexture.format = texDatas.format;
  hdTexture.minFilter = LinearFilter;
  hdTexture.magFilter = LinearFilter;
  hdTexture.wrapT = ClampToEdgeWrapping;
  hdTexture.wrapS = ClampToEdgeWrapping;
  hdTexture.needsUpdate = true;

  return hdTexture;
};

export default class GameIconsHD {
  renderGameIcons(renderer, gameIconsDds) {
    const width = 56;
    const height = 56;

    const iconNames = [
      "minerals",
      "vespeneZerg",
      "vespeneTerran",
      "vespeneProtoss",
      "zerg",
      "terran",
      "protoss",
      "energy",
    ];

    const ortho = new OrthographicCamera();

    renderer.setSize(width, height);

    const scene = new Scene();

    for (let i = 0; i < iconNames.length; i++) {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = width;
      canvas.height = height;

      const texture = loadDds(gameIconsDds[i]);
      scene.background = texture;
      renderer.render(scene, ortho);

      ctx.scale(1, -1);
      ctx.drawImage(renderer.domElement, 0, 0, width, -height);
      this[iconNames[i]] = canvas.toDataURL("image/png");

      // create a 50% transparent image for use with css background-image
      const alphaCanvas = document.createElement("canvas");
      const actx = alphaCanvas.getContext("2d");
      alphaCanvas.width = width;
      alphaCanvas.height = height;
      actx.scale(1, -1);
      actx.globalAlpha = 0.5;
      actx.drawImage(renderer.domElement, 0, 0, width, -height);
      this[`${iconNames[i]}Alpha`] = alphaCanvas.toDataURL("image/png");
    }
  }
}
