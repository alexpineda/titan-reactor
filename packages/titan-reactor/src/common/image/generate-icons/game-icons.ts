import { ImageDAT } from "../../types";
import { OrthographicCamera, Scene, WebGLRenderer } from "three";

import { loadDDS } from "../formats/load-dds";
import GrpSDLegacy from "../atlas/atlas-sd-legacy";
import { rgbToCanvas } from "../canvas";

// @todo break this up into multiple files
export default class GameIcons extends Array {
  wireframes: string[] = [];
  icons?: string[] & Partial<{ offX: number; offY: number }>;
  iconsAlpha?: string[];

  zerg = "";
  terran = "";
  protoss = "";
  zergAlpha = "";
  terranAlpha = "";
  protossAlpha = "";

  minerals = "";
  vespeneZerg = "";
  vespeneTerran = "";
  vespeneProtoss = "";
  energy = "";

  static override get [Symbol.species]() {
    return Array;
  }

  renderRaceInset(renderer: WebGLRenderer, dds: Buffer[]) {
    return this.renderGameIcons(
      renderer,
      null,
      null,
      dds.filter((dds, i) => i > 2 && i < 6),
      ["zerg", "terran", "protoss"],
      0.4
    );
  }

  renderCmdIcons(renderer: WebGLRenderer, dds: Buffer[]) {
    return this.renderGameIcons(renderer, 64, 64, dds, undefined, 0, "#ff0000");
  }

  renderResourceIcons(renderer: WebGLRenderer, dds: Buffer[]) {
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

  async renderGameIcons(
    renderer: WebGLRenderer,
    fixedWidth: number | null,
    fixedHeight: number | null,
    dds: Buffer[],
    aliases?: string[],
    alpha = 0,
    color: string | null = null
  ) {
    const ortho = new OrthographicCamera(-1, 1, 1, -1);

    const scene = new Scene();

    if (!aliases) {
      this.icons = [];
      this.iconsAlpha = [];
    }

    for (let i = 0; i < dds.length; i++) {
      if (aliases && aliases[i] === undefined) {
        continue;
      }
      const texture = await loadDDS(dds[i]);

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("Could not create canvas context");
      }

      const width = fixedWidth ?? texture.image.width;
      const height = fixedHeight ?? texture.image.height;

      renderer.setSize(width, height);

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
      } else if (this.icons) {
        this.icons[i] = canvas.toDataURL("image/png");
      }
      if (alpha) {
        // create a 50% transparent image for use with css background-image
        const alphaCanvas = document.createElement("canvas");
        const actx = alphaCanvas.getContext("2d");
        if (!actx) {
          throw new Error("Could not create canvas context");
        }
        alphaCanvas.width = width;
        alphaCanvas.height = height;
        actx.scale(1, -1);
        actx.globalAlpha = alpha;
        actx.drawImage(renderer.domElement, 0, 0, width, -height);
        if (aliases) {
          this[`${aliases[i]}Alpha`] = alphaCanvas.toDataURL("image/png");
        } else if (this.iconsAlpha) {
          this.iconsAlpha[i] = alphaCanvas.toDataURL("image/png");
        }
      }
    }
  }

  async renderCursor(grp: Buffer, palette: Uint8Array) {
    const grpSD = new GrpSDLegacy();

    await grpSD.load({
      readGrp: () => Promise.resolve(grp),
      imageDef: {} as ImageDAT,
      palettes: [palette],
    });

    if (!grpSD.texture || !grpSD.frames) {
      throw new Error("Could not load grp");
    }
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
      if (!ctx) {
        throw new Error("Could not create canvas context");
      }
      ctx.drawImage(canvas, grpX + x, grpY + y, w, h, 0, 0, w, h);
      return dest.toDataURL("image/png");
    });
  }

  async renderCenteredCursor(grp: Buffer, palette: Uint8Array) {
    const grpSD = new GrpSDLegacy();

    await grpSD.load({
      readGrp: () => Promise.resolve(grp),
      imageDef: {} as ImageDAT,
      palettes: [palette],
    });

    if (
      !grpSD.texture ||
      !grpSD.frames ||
      !grpSD.grpHeight ||
      !grpSD.grpWidth
    ) {
      throw new Error("Could not load grp");
    }
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
      if (!ctx) {
        throw new Error("Could not create canvas context");
      }
      ctx.drawImage(canvas, grpX + x, grpY + y, w, h, dx, dy, w, h);
      return dest.toDataURL("image/png");
    });

    this.icons.offX = maxOx;
    this.icons.offY = maxOy;
  }

  async renderWireframes(renderer: WebGLRenderer, dds: Buffer[]) {
    this.wireframes = [];

    const ortho = new OrthographicCamera(-1, 1, 1, -1);

    const scene = new Scene();

    for (let i = 0; i < dds.length; i++) {
      const texture = await loadDDS(dds[i]);

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("Could not create canvas context");
      }

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
