import {
  DefaultLoadingManager,
  TextureLoader,
  SpriteMaterial,
  Sprite,
  sRGBEncoding,
  Vector2,
  RepeatWrapping,
  LinearFilter,
  ClampToEdgeWrapping,
  BufferAttribute,
} from "three";
import { Grp } from "../../../../libs/bw-chk/grp";
import { Buffer } from "buffer/";
import { imageToCanvasTexture } from "../../3d-map-rendering/textures/imageToCanvasTexture";
import { range, groupBy, all } from "ramda";
import Worker from "../packbin.worker.js";
import { asyncFilter } from "./async";

export class LoadSprite {
  constructor(
    tileset,
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
    this.tileset = tileset;
    this.atlas = [];
    this.maxDimensions = [];
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
        //since we're already initializing a Grp, document it's max dimensions for reference later
        this.maxDimensions[imageId + imageOffset] = grp.maxDimensions();
        return range(0, grp.frameCount()).map((frame) => {
          const { w, h } = grp.header(frame);
          return { w, h, data: { imageId: imageId + imageOffset, frame } };
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

    const playerMaskPalette = new Buffer(this.tileset.palettes[0]);

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
          throw new Error("frame was excluded");
        }
        if (result.pages.length === 0) {
          throw new Error("no frames were packed");
        }
        if (result.pages.length > 1) {
          throw new Error("multiple pages not implemented");
        }

        const { w, h, rects: origRects } = result.pages[0];
        const rects = origRects.map(({ x, y, w, h, data }) => ({
          x,
          y,
          w,
          h,
          ...data,
          bucketId,
        }));
        const out = new Buffer(w * h * 4);
        const maskOut = new Buffer(w * h * 4);

        //draw out
        bufs.forEach((buf, i) => {
          const grp = new Grp(buf, Buffer);

          //@todo support mapping 5, special - own cloak
          const remapping =
            this.images[i].remapping < 5 ? this.images[i].remapping : 0;

          rects
            .filter((rect) => rect.imageId === i)
            .forEach((rect) => {
              const { data: grpData } = grp.decode(
                rect.frame,
                this.tileset.palettes[remapping]
              );

              const { data: playerMaskData } = grp.decode(
                rect.frame,
                playerMaskPalette
              );

              for (let y = 0; y < rect.h; y++) {
                for (let x = 0; x < rect.w; x++) {
                  let pos = ((y + rect.y) * w + (x + rect.x)) * 4;
                  let spritePos = (y * rect.w + x) * 4;

                  out[pos] = grpData[spritePos];
                  out[pos + 1] = grpData[spritePos + 1];
                  out[pos + 2] = grpData[spritePos + 2];
                  out[pos + 3] = grpData[spritePos + 3];

                  const maskAlpha = playerMaskData[spritePos] > 0 ? 255 : 0;
                  maskOut[pos] = playerMaskData[spritePos];
                  maskOut[pos + 1] = playerMaskData[spritePos + 1];
                  maskOut[pos + 2] = playerMaskData[spritePos + 2];
                  maskOut[pos + 3] = maskAlpha;
                }
              }
            });
        });

        const frameGroups = Object.values(
          groupBy(({ imageId }) => imageId, rects)
        );

        const images = frameGroups.map(
          (frames) => new AtlasImage(frames, w, h, bucketId)
        );
        this.atlas = this.atlas.concat(images);
        this.textureCache.save(`unit-${bucketId}`, out, w, h);
        this.textureCache.save(`mask-${bucketId}`, maskOut, w, h);

        this.textures[bucketId] = createTexture(out, w, h);
        this.masks[bucketId] = createTexture(maskOut, w, h);

        this.loadingManager.itemEnd(`sd-texture-packing-${bucketId}`);

        if (bucketId === bucketSizes.length - 1) {
          console.log("atlas:complete", this);
          this.jsonCache.save(`sd-frames`, this.atlas);
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
    const map = this.textures[this.atlas[image].bucketId];
    //@todo implement mask
    const [w, h] = this.maxDimensions[image];
    debugger;
    const sprite = new Sprite(new SpriteMaterial({ map }));
    sprite.geometry = sprite.geometry.clone();
    sprite.center = new Vector2(0.5, 0);
    sprite.scale.set(w / 32, h / 32, 1);
    sprite.material.transparent = true;

    return sprite;
  }

  setFrame(mesh, imageId, frameId, flip) {
    const f = frameId % 17;
    const image = this.atlas[imageId];

    mesh.geometry.setAttribute(
      "uv",
      new BufferAttribute(image.uv(f), 2, false)
    );
  }

  load(file, name = "", userData = {}) {
    return new Promise((resolve, reject) => {
      new TextureLoader(this.loadingManager).load(
        file,
        (map) => {
          map.encoding = sRGBEncoding;
          const sprite = new Sprite(new SpriteMaterial({ map }));
          sprite.center = new Vector2(0.5, 0);
          Object.assign(sprite, { name, userData });
          resolve(sprite);
        },
        undefined,
        function (error) {
          reject(error);
        }
      );
    });
  }

  loadSync(file, name = "", userData = {}) {
    const map = new TextureLoader(this.loadingManager).load(file);
    map.encoding = sRGBEncoding;
    const sprite = new Sprite(new SpriteMaterial({ map }));
    sprite.center = new Vector2(0.5, 0);

    return sprite;
  }
}

class AtlasImage {
  constructor(frames, w, h, bucketId) {
    // hydrate if from json
    if (frames.frames) {
      Object.assign(this, frames);
    } else {
      this.frames = frames;
      this.w = w;
      this.h = h;
      this.bucketId = bucketId;
    }
  }

  uv(frame) {
    return this._uv(this.frames[frame]);
  }

  _uv(frame) {
    return new Float32Array([
      frame.x / this.w,
      1 - (frame.y + frame.h) / this.h,
      frame.x / this.w,
      1 - frame.y / this.h,
      (frame.x + frame.w) / this.w,
      1 - frame.y / this.h,
      (frame.x + frame.w) / this.w,
      1 - (frame.y + frame.h) / this.h,
    ]);
  }
}
