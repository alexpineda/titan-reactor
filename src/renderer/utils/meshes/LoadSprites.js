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
import { BP2D } from "binpackingjs";
import { range } from "ramda";

export class LoadSprite {
  constructor(
    tileset,
    images,
    fileAccess,
    textureSize,
    loadingManager = DefaultLoadingManager
  ) {
    this.loadingManager = loadingManager;
    this.images = images;
    this.fileAccess = fileAccess;
    this.textureSize = textureSize;
    this.tileset = tileset;
    this._grp = {};
  }

  async loadAll() {
    const { Bin, Box, Packer } = BP2D;
    //new container -> grab, pack -> grab -> pack -> fail <- finalize -> new container
    const bin = new Bin(this.textureSize, this.textureSize);
    const packer = new Packer([bin]);

    //@todo maybe load grp as needed instead of preload
    const bufs = await Promise.all(
      this.images.map((image) => this.fileAccess(image.grpFile))
    );
    // const grps = bufs.map((buf) => );

    let packedGrps = [];
    let prevPacked = [];

    let buckets = [null];
    if (this.textureSize >= 8192) {
      buckets = [null];
    } else if (this.textureSize >= 4096) {
      // hand optimized texture "buckets"
      // @todo automate to allow for modded GRPs
      buckets = [130, 300, 550, null];
    } else {
      throw new Error("texture size not supported");
    }

    const textures = [];
    buckets.reduce((bucketOffset, bucketSize, i) => {
      debugger;
      let bucket;
      if (i === buckets.length - 1) {
        bucket = bufs.slice(bucketOffset);
      } else {
        bucket = bufs.slice(bucketOffset, bucketOffset + bucketSize);
      }

      const boxes = bucket.flatMap((buf) => {
        const grp = new Grp(buf, Buffer);
        return range(0, grp.frameCount()).map((frame) => {
          const { w, h } = grp.header(frame);
          return Object.assign(new Box(w, h), { buf, frame });
        });
      });

      const sizeBucket = bucket.reduce((total, buf) => {
        const grp = new Grp(buf, Buffer);
        return (
          total +
          range(0, grp.frameCount()).reduce((grpSize, frame) => {
            const { w, h } = grp.header(frame);
            return grpSize + w * h;
          }, 0)
        );
      }, 0);

      let out, width, height;
      if (Math.sqrt(sizeBucket) >= 4096) {
        out = Buffer.alloc(8192 * 8192);
        width = 4096;
        height = 4096;
      } else {
        out = Buffer.alloc(4096 * 4096);
        width = 2048;
        height = 2048;
      }

      const packed = packer.pack(boxes);
      if (packed.length != boxes.length) {
        throw new Error("could not pack all frames");
      }
      packed.forEach(({ x, y, width, height, buf, frame }) => {
        const grp = new Grp(buf, Buffer);
        grp.render(
          frame,
          this.tileset.palettes[0],
          out,
          x,
          y,
          width,
          height,
          1,
          1
        );
      });
      console.log("packed & rendered");
      textures.push(imageToCanvasTexture(out, width, height, "rgba"));
    }, 0);
    console.log("textures", textures);

    buckets.reduce((bucketOffset, bucketSize, i) => {
      let bucket;
      if (i === buckets.length - 1) {
        bucket = bufs.slice(bucketOffset);
      } else {
        bucket = bufs.slice(bucketOffset, bucketOffset + bucketSize);
      }
      const sizeBucket = bucket.reduce((total, buf) => {
        const grp = new Grp(buf, Buffer);
        return (
          total +
          range(0, grp.frameCount()).reduce((grpSize, frame) => {
            const { w, h } = grp.header(frame);
            return grpSize + w * h;
          }, 0)
        );
      }, 0);
      const sizeFrame = bucket.reduce((total, buf) => {
        const grp = new Grp(buf, Buffer);
        return total + grp.frameCount();
      }, 0);
      console.log(bucket.length, sizeBucket, Math.sqrt(sizeBucket), sizeFrame);
      return bucketOffset + bucket.length;
    }, 0);

    return;
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
