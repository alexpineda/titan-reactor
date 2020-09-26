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
import { TextureCache } from "../../3d-map-rendering/textures/TextureCache";

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

        bufs.forEach((buf, i) => {
          const grp = new Grp(buf, Buffer);

          //@todo support mapping 5, special - own cloak
          const remapping =
            this.images[i].remapping < 5 ? this.images[i].remapping : 0;

          rects
            .filter((rect) => rect.data.imageId === i)
            .forEach((rect) => {
              //@todo remap for player color magenta
              const { data: color } = grp.decode(
                rect.data.frame,
                this.tileset.palettes[remapping]
              );

              for (let y = 0; y < rect.h; y++) {
                for (let x = 0; x < rect.w; x++) {
                  let pos = ((y + rect.y) * w + (x + rect.x)) * 4;
                  let spritePos = (y * rect.w + x) * 4;

                  out[pos] = color[spritePos];
                  out[pos + 1] = color[spritePos + 1];
                  out[pos + 2] = color[spritePos + 2];
                  out[pos + 3] = color[spritePos + 3];
                }
              }
            });
        });

        this.textureCache.save(`sd-${bucketId}`, out, w, h);
        this.jsonCache.save(`sd-${bucketId}`, { bucketId, rects });

        this.loadingManager.itemEnd(`sd-texture-packing-${bucketId}`);

        bins.push(data);
        if (bucketId === bucketSizes.length - 1) {
          console.log("all complete");

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

  //@todo get rid of async, load atlas
  async getFrame(file, frame, flip, remapping) {
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
