import {
  DefaultLoadingManager,
  TextureLoader,
  SpriteMaterial,
  Sprite,
  sRGBEncoding,
  Vector2,
  RepeatWrapping,
} from "three";
import { Grp } from "../../../../libs/bw-chk/grp";
import { Buffer } from "buffer/";
import { imageToCanvasTexture } from "../../3d-map-rendering/textures/imageToCanvasTexture";
import { range } from "ramda";
import Worker from "../packbin.worker.js";
import { units } from "../../../common/bwdat/units";

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
    this._grp = {};
  }

  async loadAll() {
    const bufs = await Promise.all(
      this.images.map((image) => this.fileAccess(image.grpFile))
    );

    //fixed amount of units per texture, obviously not optimal but sufficient for our needs, total texture size for all units ~300mb
    const sizePerBucket = 30;
    const bucketSizes = range(0, Math.ceil(bufs.length / sizePerBucket)).map(
      (_) => sizePerBucket
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
    let bins = [];

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

        const { w, h, rects } = result.pages[0];

        const out = new Buffer(w * h * 4);
        const maskOut = new Buffer(w * h * 4);

        bufs.forEach((buf, i) => {
          const grp = new Grp(buf, Buffer);

          //@todo support mapping 5, special - own cloak
          const remapping =
            this.images[i].remapping < 5 ? this.images[i].remapping : 0;

          rects
            .filter((rect) => rect.data.imageId === i)
            .forEach((rect) => {
              const { data: grpData } = grp.decode(
                rect.data.frame,
                this.tileset.palettes[remapping]
              );

              const { data: playerMaskData } = grp.decode(
                rect.data.frame,
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

        this.textureCache.save(`unit-${bucketId}`, out, w, h);
        this.textureCache.save(`mask-${bucketId}`, maskOut, w, h);
        this.jsonCache.save(`sd-${bucketId}`, { bucketId, rects });

        this.loadingManager.itemEnd(`sd-texture-packing-${bucketId}`);

        bins.push(data);
        if (bucketId === bucketSizes.length - 1) {
          console.log(
            "total size",
            bins.reduce(
              (total, { result }) =>
                total + result.pages[0].w * result.pages[0].h,
              0
            )
          );
          res();
        } else {
          workerStart(buckets[bucketId + 1]);
        }
      };
    });

    workerStart(buckets[0]);

    await workersDone;
  }

  async getFrame(file, frame, flip, remapping) {
    throw new Error("reimplement using loaded atlas");
    this.loadingManager.itemStart(file);
    const buf = this._grp[file] || (await this.fileAccess(file));
    this._grp[file] = buf;
    const grp = new Grp(buf, Buffer);
    const { data, x, y, w, h } = grp.decode(
      frame,
      this.tileset.palettes[remapping]
    );
    const map = imageToCanvasTexture(data, w, h, "rgba");
    if (flip) {
      map.wrapS = RepeatWrapping;
      map.repeat.x = -1;
    }

    this.loadingManager.itemEnd(file);
    return { map, w, h };
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
