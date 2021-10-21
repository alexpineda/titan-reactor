import {
  OrthographicCamera,
  Scene,
  CompressedTexture,
  LinearFilter,
  ClampToEdgeWrapping,
  Color,
} from "three";
import { DDSLoader } from "./DDSLoader";
import { rgbToCanvas } from "./canvas";
import GrpSD from "./GrpSD";

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
    return this.renderGameIcons(
      renderer,
      64,
      64,
      dds,
      undefined,
      false,
      "#ff0000"
    );
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

  renderGameIcons(
    renderer,
    fixedWidth,
    fixedHeight,
    dds,
    aliases,
    alpha,
    color = null
  ) {
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

      ctx.save();
      ctx.scale(1, -1);
      ctx.drawImage(renderer.domElement, 0, 0, width, -height);
      ctx.restore();

      if (color) {
        // white -> color outlines
        ctx.save();
        ctx.globalCompositeOperation = "multiply";
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, width, height);
        ctx.restore();

        // restore alpha of original
        ctx.save();
        ctx.globalCompositeOperation = "destination-atop";
        ctx.scale(1, -1);
        ctx.drawImage(renderer.domElement, 0, 0, width, -height);
        ctx.restore();
      }

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

    this.icons = grpSD.frames.map(({ x, y, grpX, grpY, w, h }) => {
      const dest = document.createElement("canvas");
      dest.width = w;
      dest.height = h;
      const ctx = dest.getContext("2d");
      ctx.drawImage(canvas, grpX + x, grpY + y, w, h, 0, 0, w, h);
      return dest.toDataURL("image/png");
    });
  }

  async renderCenteredCursor(grp, palette) {
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

    const gw = grpSD.grpWidth / 2;
    const gh = grpSD.grpHeight / 2;

    //max frame dims, max frame offsets from center
    const maxW = grpSD.frames.reduce((max, { w }) => (w > max ? w : max), 0);
    const maxH = grpSD.frames.reduce((max, { h }) => (h > max ? h : max), 0);
    const maxOx = grpSD.frames.reduce(
      (max, { x }) => (gw - x > max ? gw - x : max),
      0
    );
    const maxOy = grpSD.frames.reduce(
      (max, { y }) => (gh - y > max ? gh - y : max),
      0
    );

    this.icons = grpSD.frames.map(({ x, y, grpX, grpY, w, h }) => {
      const dest = document.createElement("canvas");
      dest.width = maxW;
      dest.height = maxH;

      const dx = maxOx - (gw - x);
      const dy = maxOy - (gh - y);

      const ctx = dest.getContext("2d");
      ctx.drawImage(canvas, grpX + x, grpY + y, w, h, dx, dy, w, h);
      return dest.toDataURL("image/png");
    });

    this.icons.offX = maxOx;
    this.icons.offY = maxOy;
  }

  renderWireframes(renderer, dds, color = new Color(1, 0, 0)) {
    this.wireframes = [];

    const ortho = new OrthographicCamera();

    const scene = new Scene();

    for (let i = 0; i < dds.length; i++) {
      const texture = loadDds(dds[i]);

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      const width = texture.image.width;
      const height = texture.image.height;

      renderer.setSize(width, height);

      // we dont need the last 2 frames
      const optWidth = width - 128 * 2;

      canvas.width = optWidth;
      canvas.height = height;
      scene.background = texture;

      renderer.render(scene, ortho);

      ctx.save();
      ctx.scale(1, -1);
      ctx.drawImage(
        renderer.domElement,
        0,
        0,
        optWidth,
        height,
        0,
        0,
        optWidth,
        -height
      );
      ctx.restore();

      // white -> red outlines
      ctx.save();
      ctx.globalCompositeOperation = "multiply";
      ctx.fillStyle = "red";
      ctx.fillRect(0, 0, optWidth, height);
      ctx.restore();

      // restore alpha of original
      ctx.save();
      ctx.globalCompositeOperation = "destination-atop";
      ctx.scale(1, -1);
      ctx.drawImage(
        renderer.domElement,
        0,
        0,
        optWidth,
        height,
        0,
        0,
        optWidth,
        -height
      );
      ctx.restore();

      this.wireframes[i] = canvas.toDataURL("image/png");
    }
  }
}
