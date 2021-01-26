import {
  DefaultLoadingManager,
  SpriteMaterial,
  Sprite,
  sRGBEncoding,
  Vector2,
  RepeatWrapping,
  LinearFilter,
  ClampToEdgeWrapping,
  BufferAttribute,
  DynamicDrawUsage,
  MeshStandardMaterial,
  RGBADepthPacking,
  MeshDepthMaterial,
} from "three";
import { Grp } from "bw-chk-modified/grp";
import { Buffer } from "buffer/";
import { imageToCanvasTexture } from "titan-reactor-shared/image/imageToCanvasTexture";
import { range, groupBy } from "ramda";
import Worker from "./packbin.worker.js";
import { asyncFilter } from "../utils/async";

export class LoadSprite {
  constructor(
    palettes,
    images,
    fileAccess,
    textureCache,
    jsonCache,
    maxTextureSize,
    loadingManager = DefaultLoadingManager
  ) {
    this.loadingManager = loadingManager;
    this.images = images;
    this.fileAccess = fileAccess;
    this.maxTextureSize = maxTextureSize;
    this.textureCache = textureCache;
    this.jsonCache = jsonCache;
    this.palettes = palettes;
    this.atlas = [];
    this.textures = [];
    this.masks = [];
    this.loaded = false;
  }

  async loadAll() {
    const bufs = await Promise.all(
      this.images.map((image) => this.fileAccess(image.grpFile))
    );

    //fixed amount of units per texture, obviously not optimal but sufficient for our needs, total texture size for all units ~300mb
    const unitsPerBucket = 30;
    const bucketSizes = range(0, Math.ceil(bufs.length / unitsPerBucket)).map(
      (_) => unitsPerBucket
    );

    let imageOffset = 0;
    const buckets = bucketSizes.map((bucketSize, i) => {
      let bucket;
      if (
        i === bucketSizes.length - 1 ||
        bucketSize + bucketSize >= bufs.length
      ) {
        bucket = bufs.slice(imageOffset);
      } else {
        bucket = bufs.slice(imageOffset, imageOffset + bucketSize);
      }

      const boxes = bucket.flatMap((buf, imageId) => {
        const grp = new Grp(buf, Buffer);
        const max = grp.maxDimensions();
        return range(0, grp.frameCount()).map((frame) => {
          const { x, y, w, h } = grp.header(frame);
          return {
            w: max.w,
            h: max.h,
            data: {
              imageId: imageId + imageOffset,
              frame: {
                frame,
                x,
                y,
                w,
                h,
              },
            },
          };
        });
      });

      imageOffset = imageOffset + bucket.length;
      return {
        boxes,
        textureSize: this.maxTextureSize,
        bucketId: i,
      };
    }); //end bucket creation

    const worker = new Worker();
    const workerStart = (bucket) => {
      this.loadingManager.itemStart(`sd-texture-packing-${bucket.bucketId}`);
      worker.postMessage(bucket);
    };

    const playerMaskPalette = new Buffer(this.palettes[0]);

    for (let i = 0; i < playerMaskPalette.byteLength; i = i + 3) {
      playerMaskPalette[i] = 0;
      playerMaskPalette[i + 1] = 0;
      playerMaskPalette[i + 2] = 0;
    }

    // using R value of the red player to determine mask alphas (tunit.pcx)
    // @todo use RGBAInteger format in shader and use tunit.pcx to apply nuances in colors
    const playerColors = [244, 168, 168, 132, 96, 72, 52, 16];

    for (let i = 0; i < 8; i++) {
      playerMaskPalette[(i + 0x8) * 4 + 0] = playerColors[i];
      playerMaskPalette[(i + 0x8) * 4 + 1] = playerColors[i];
      playerMaskPalette[(i + 0x8) * 4 + 2] = playerColors[i];
    }

    const createTexture = (data, w, h) => {
      const texture = imageToCanvasTexture(data, w, h, "rgba");
      texture.encoding = sRGBEncoding;
      texture.minFilter = LinearFilter;
      texture.magFilter = LinearFilter;
      texture.wrapT = ClampToEdgeWrapping;
      texture.wrapS = RepeatWrapping;
      return texture;
    };

    const workersDone = new Promise(async (res, rej) => {
      worker.onmessage = ({ data }) => {
        const { result, bucketId } = data;
        if (result.notPacked.length) {
          rej({
            err: new Error(`frame was excluded in bucket ${bucketId}`),
            data: result,
          });
        }
        if (result.pages.length === 0) {
          rej({
            err: new Error(`no frames were packed in bucket ${bucketId}`),
            data: result,
          });
        }
        if (result.pages.length > 1) {
          rej({
            err: new Error(
              `multiple pages not implemented in bucket ${bucketId}`
            ),
            data: result,
          });
        }

        const { w: pW, h: pH, rects: origRects } = result.pages[0];
        const rects = origRects.map(({ x, y, w, h, data }) => ({
          x,
          y,
          w,
          h,
          ...data,
          bucketId,
        }));

        const out = new Buffer(pW * pH * 4);
        const maskOut = new Buffer(pW * pH * 4);

        //draw out
        bufs.forEach((buf, i) => {
          const grp = new Grp(buf, Buffer);

          //@todo support mapping 5, special - own cloak
          const remapping =
            this.images[i].remapping < 5 ? this.images[i].remapping : 0;

          rects
            .filter((rect) => rect.imageId === i)
            .forEach(
              ({
                x: rX,
                y: rY,
                w: rW,
                frame: { frame, x: fX, y: fY, w: fW, h: fH },
              }) => {
                const { data: grpData } = grp.decode(
                  frame,
                  this.palettes[remapping]
                );

                const { data: playerMaskData } = grp.decode(
                  frame,
                  playerMaskPalette
                );

                for (let y = 0; y < fH; y++) {
                  for (let x = 0; x < fW; x++) {
                    let pos = ((y + fY + rY) * pW + (x + fX + rX)) * 4;
                    let spritePos = (y * fW + x) * 4;

                    out[pos] = grpData[spritePos];
                    out[pos + 1] = grpData[spritePos + 1];
                    out[pos + 2] = grpData[spritePos + 2];
                    out[pos + 3] = grpData[spritePos + 3];

                    const maskAlpha = grpData[spritePos] > 0 ? 255 : 0;
                    maskOut[pos] = maskAlpha;
                    maskOut[pos + 1] = maskAlpha;
                    maskOut[pos + 2] = maskAlpha;
                    maskOut[pos + 3] = 255;
                  }
                }
              }
            );
        });

        const frameGroups = Object.values(
          groupBy(({ imageId }) => imageId, rects)
        );

        const images = frameGroups.map(
          (frames) => new AtlasImage(frames, pW, pH, bucketId)
        );

        this.atlas = this.atlas.concat(images);
        this.textureCache.save(`unit-${bucketId}`, out, pW, pH);
        this.textureCache.save(`mask-${bucketId}`, maskOut, pW, pH);

        this.textures[bucketId] = createTexture(out, pW, pH);
        this.masks[bucketId] = createTexture(maskOut, pW, pH);

        this.loadingManager.itemEnd(`sd-texture-packing-${bucketId}`);

        if (bucketId === bucketSizes.length - 1) {
          console.log("atlas:complete", this);
          this.jsonCache.save(`sd-atlas`, this.atlas);
          this.loaded = true;
          res();
        } else {
          workerStart(buckets[bucketId + 1]);
        }
      };

      const exists = await asyncFilter(buckets, async ({ bucketId }) => {
        return (
          (await this.textureCache.exists(`unit-${bucketId}`)) &&
          (await this.textureCache.exists(`mask-${bucketId}`))
        );
      });

      if (
        exists.length === buckets.length &&
        (await this.jsonCache.exists(`sd-atlas`))
      ) {
        try {
          this.atlas = (await this.jsonCache.get(`sd-atlas`)).map(
            (atlasImage) => new AtlasImage(atlasImage)
          );

          buckets.forEach(async ({ bucketId }) => {
            const texture = await this.textureCache.get(`unit-${bucketId}`);
            const mask = await this.textureCache.get(`mask-${bucketId}`);

            this.textures[bucketId] = createTexture(
              texture.data,
              texture.width,
              texture.height
            );
            this.masks[bucketId] = createTexture(
              mask.data,
              mask.width,
              mask.height
            );
          });

          this.loaded = true;
          res();
        } catch (e) {
          console.log("error loading sprites from cache");
          workerStart(buckets[0]);
        }
      } else {
        workerStart(buckets[0]);
      }
    });

    await workersDone;
  }

  getMesh(image) {
    const { bucketId, w, h } = this.atlas[image];

    const maxFrameBottom = this.atlas[image].frameGroup.reduce(
      (max, { h, frame }) => {
        if (h - frame.h - frame.y > max) {
          max = h - frame.h - frame.y;
        }
        return max;
      },
      0
    );

    const yOff = maxFrameBottom / this.atlas[image].frameGroup[0].h;
    const map = this.textures[bucketId];

    // const sprite = new SDSprite(new MeshStandardMaterial({ map }));
    // sprite.customDepthMaterial = new MeshDepthMaterial({
    //   depthPacking: RGBADepthPacking,
    //   map: this.masks[bucketId],
    //   alphaTest: 0.5,
    // });

    const sprite = new Sprite(new SpriteMaterial({ map }));
    sprite.geometry = sprite.geometry.clone();

    const ba = new BufferAttribute(
      new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]),
      2,
      false
    );
    ba.usage = DynamicDrawUsage;
    sprite.geometry.setAttribute("uv", ba);
    sprite.center = new Vector2(0.5, yOff - 0.1);
    sprite.scale.set(w / 32, h / 32, 1);
    sprite.material.transparent = true;
    sprite.material.alphaTest = 0.01;
    sprite.castShadow = true;

    return sprite;
  }

  setFrame(mesh, imageId, frameId, flip) {
    const image = this.atlas[imageId];
    const uv = mesh.geometry.getAttribute("uv");
    uv.set(image.uv(frameId, flip));
    uv.needsUpdate = true;
  }
}

class AtlasImage {
  constructor(frameGroup, w, h, bucketId) {
    // hydrate if from json
    if (frameGroup.frameGroup) {
      Object.assign(this, frameGroup);
    } else {
      this.frameGroup = frameGroup;
      this.w = frameGroup[0].w;
      this.h = frameGroup[0].h;
      this.pW = w;
      this.pH = h;
      this.bucketId = bucketId;
    }
  }

  frameFloorOffset(image, frameId) {
    const frame = image.frameGroup[frameId].frame;

    return (image.h - frame.h - frame.y) / 32;
  }

  uv(frame, flipFrame) {
    return this._uv(this.frameGroup[frame], flipFrame);
  }

  _uv(frame, flipFrame) {
    if (frame === undefined) debugger;
    return flipFrame
      ? new Float32Array([
          (frame.x + frame.w) / this.pW,
          1 - (frame.y + frame.h) / this.pH,

          frame.x / this.pW,
          1 - (frame.y + frame.h) / this.pH,

          frame.x / this.pW,
          1 - frame.y / this.pH,

          (frame.x + frame.w) / this.pW,
          1 - frame.y / this.pH,
        ])
      : new Float32Array([
          frame.x / this.pW,
          1 - (frame.y + frame.h) / this.pH,

          (frame.x + frame.w) / this.pW,
          1 - (frame.y + frame.h) / this.pH,

          (frame.x + frame.w) / this.pW,
          1 - frame.y / this.pH,

          frame.x / this.pW,
          1 - frame.y / this.pH,
        ]);
  }
}
