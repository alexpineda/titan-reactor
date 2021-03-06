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
  renderCmdIcons(renderer, dds) {
    return this.renderGameIcons(renderer, 128, 128, dds, undefined, false);
  }

  renderResourceIcons(renderer, dds) {
    return this.renderGameIcons(
      renderer,
      56,
      56,
      dds,
      [
        "minerals",
        "vespeneZerg",
        "vespeneTerran",
        "vespeneProtoss",
        "zerg",
        "terran",
        "protoss",
        "energy",
      ],
      true
    );
  }

  renderGameIcons(renderer, width, height, dds, aliases, includeAlpha) {
    const ortho = new OrthographicCamera();

    renderer.setSize(width, height);

    const scene = new Scene();

    if (!aliases) {
      this.icons = [];
      this.iconsAlpha = [];
    }

    for (let i = 0; i < dds.length; i++) {
      if (aliases && aliases[i] === undefined) {
        continue;
      }
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = width;
      canvas.height = height;

      const texture = loadDds(dds[i]);
      scene.background = texture;
      renderer.render(scene, ortho);

      ctx.scale(1, -1);
      ctx.drawImage(renderer.domElement, 0, 0, width, -height);
      if (aliases) {
        this[aliases[i]] = canvas.toDataURL("image/png");
      } else {
        this.icons[i] = canvas.toDataURL("image/png");
      }

      if (includeAlpha) {
        // create a 50% transparent image for use with css background-image
        const alphaCanvas = document.createElement("canvas");
        const actx = alphaCanvas.getContext("2d");
        alphaCanvas.width = width;
        alphaCanvas.height = height;
        actx.scale(1, -1);
        actx.globalAlpha = 0.5;
        actx.drawImage(renderer.domElement, 0, 0, width, -height);
        if (aliases) {
          this[`${aliases[i]}Alpha`] = alphaCanvas.toDataURL("image/png");
        } else {
          this.iconsAlpha[i] = alphaCanvas.toDataURL("image/png");
        }
      }
    }
  }
}
