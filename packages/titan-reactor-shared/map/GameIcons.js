import {
  OrthographicCamera,
  Scene,
  CompressedTexture,
  LinearFilter,
  ClampToEdgeWrapping,
} from "three";
import { DDSLoader } from "titan-reactor-shared/image/DDSLoader";
import { rgbToCanvas } from "../image/canvas";
import GrpSD from "../image/GrpSD";

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

export default class GameIcons {
  renderRaceInset(renderer, dds) {
    return this.renderGameIcons(
      renderer,
      null,
      null,
      dds.filter((dds, i) => i > 2 && i < 6),
      ["zerg", "terran", "protoss"],
      0.4
    );
  }

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
      0.5
    );
  }

  renderGameIcons(renderer, fixedWidth, fixedHeight, dds, aliases, alpha) {
    const ortho = new OrthographicCamera();

    let width = fixedWidth;
    let height = fixedHeight;

    if (width) {
      renderer.setSize(width, height);
    }
    const scene = new Scene();

    if (!aliases) {
      this.icons = [];
      this.iconsAlpha = [];
    }

    for (let i = 0; i < dds.length; i++) {
      if (aliases && aliases[i] === undefined) {
        continue;
      }
      const texture = loadDds(dds[i]);

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!fixedWidth) {
        width = texture.image.width;
        height = texture.image.height;
        renderer.setSize(width, height);
      }
      canvas.width = width;
      canvas.height = height;

      scene.background = texture;
      renderer.render(scene, ortho);

      ctx.scale(1, -1);
      ctx.drawImage(renderer.domElement, 0, 0, width, -height);
      if (aliases) {
        this[aliases[i]] = canvas.toDataURL("image/png");
      } else {
        this.icons[i] = canvas.toDataURL("image/png");
      }

      if (alpha) {
        // create a 50% transparent image for use with css background-image
        const alphaCanvas = document.createElement("canvas");
        const actx = alphaCanvas.getContext("2d");
        alphaCanvas.width = width;
        alphaCanvas.height = height;
        actx.scale(1, -1);
        actx.globalAlpha = alpha;
        actx.drawImage(renderer.domElement, 0, 0, width, -height);
        if (aliases) {
          this[`${aliases[i]}Alpha`] = alphaCanvas.toDataURL("image/png");
        } else {
          this.iconsAlpha[i] = alphaCanvas.toDataURL("image/png");
        }
      }
    }
  }

  async renderCursor(grp, palette) {
    const grpSD = new GrpSD();

    await grpSD.load({
      readGrp: () => grp,
      imageDef: {},
      palettes: [palette],
    });

    const canvas = rgbToCanvas(
      {
        data: grpSD.texture.image.data,
        width: grpSD.width,
        height: grpSD.height,
      },
      "rgba"
    );

    // const gw = grpSD.grpWidth;
    // const gh = grpSD.grpHeight;

    this.icons = grpSD.frames.map(({ x, y, grpX, grpY, w, h }) => {
      const dest = document.createElement("canvas");
      dest.width = w;
      dest.height = h;
      const ctx = dest.getContext("2d");
      ctx.drawImage(canvas, grpX + x, grpY + y, w, h, 0, 0, w, h);
      return dest.toDataURL("image/png");
    });
  }
}
