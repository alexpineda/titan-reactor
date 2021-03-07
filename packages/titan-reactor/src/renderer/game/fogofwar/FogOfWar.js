import {
  ClampToEdgeWrapping,
  DataTexture,
  LinearFilter,
  LuminanceFormat,
  UnsignedByteType,
  Vector2,
  Vector4,
} from "three";
import Worker from "./FogOfWar.worker.js";

import {
  Explored,
  HideSpeedSlow,
  Visible,
  RevealSpeed,
  Unexplored,
} from "./fogOfWarShared";

export default class FogOfWar {
  constructor(width, height, effect) {
    this.fogType = 0; // fade

    // for animation
    this._toBuffer = new Uint8Array(width * height);

    // for use with canvas drawing / minimap
    this.imageData = new ImageData(width, height);

    const texture = new DataTexture(
      new Uint8Array(new SharedArrayBuffer(width * height)),
      width,
      height,
      LuminanceFormat,
      UnsignedByteType
    );

    texture.flipY = false;
    texture.wrapS = ClampToEdgeWrapping;
    texture.wrapT = ClampToEdgeWrapping;

    texture.generateMipmaps = false;

    texture.magFilter = LinearFilter;
    texture.minFilter = LinearFilter;

    texture.needsUpdate = true;

    this.texture = texture;
    this.width = width;
    this.height = height;
    this.scale = 1;
    this._enabled = true;

    this._revealSpeed = RevealSpeed;
    this._hideSpeed = HideSpeedSlow;

    this.effect = effect;
    this.effect.worldOffset = new Vector2(width / 2, height / 2);
    this.effect.fog = texture;
    this.effect.fogResolution = new Vector2(width, height);
    this.effect.fogUvTransform = new Vector4(
      0,
      0,
      1 / this.width,
      1 / this.height
    );

    this.worker = new Worker();
  }

  set imageBuffer(val) {
    this.texture.image.data = val;
  }

  get imageBuffer() {
    return this.texture.image.data;
  }

  // _setUvTransform() {
  //   const width = this.fogResolution.x;
  //   const height = this.fogResolution.y;

  //   const scaleX = this.scale * this.size.x * (width / (width - 3));
  //   const scaleY = this.scale * this.size.y * (height / (height - 3));

  //   const offsetX = 1.5 / width;
  //   const offsetY = 1.5 / height;

  //   // this.fogUvTransform = new Vector4(offsetX, offsetY, 1 / scaleX, 1 / scaleY);
  // }

  get enabled() {
    return this._enabled;
  }

  set enabled(val) {
    if (val == this._enabled) return;

    if (val) {
      for (let i = 0; i < this.imageBuffer.length; i++) {
        this.imageBuffer[i] = this._toBuffer[i];
      }
    } else {
      this.imageBuffer.fill(Visible);
    }
    this.texture.needsUpdate = true;

    this._enabled = val;
  }

  isVisible(x, y) {
    return this._toBuffer[y * this.width + x] === Visible;
  }

  isExplored(x, y) {
    return this._toBuffer[y * this.width + x] === Explored;
  }

  isSomewhatVisible(x, y) {
    return this.imageBuffer[y * this.width + x] > Explored;
  }

  isSomewhatExplored(x, y) {
    return this.imageBuffer[y * this.width + x] > 0;
  }

  generate(tileData, playerVisionFlags, frame) {
    this._lastTileData = tileData;
    this._lastPlayers = playerVisionFlags;

    const msg = {
      tileBuffer: new Uint8Array(tileData.buffer),
      playerVisionFlags,
      frame,
      imageBuffer: this.imageBuffer,
      enabled: this.enabled,
      playerVisionWasToggled: this.playerVisionWasToggled,
      width: this.width,
      height: this.height,
    };

    this.worker.postMessage(msg, [msg.tileBuffer.buffer]);

    this.worker.onmessage = ({ data }) => {
      const { toBuffer, frame, imageData } = data;
      if (frame < this._lastFrame) return;
      this._lastFrame = frame;

      this.imageData = imageData;
      this._toBuffer = toBuffer;
      this.texture.needsUpdate = true;
    };

    // for (let i = 0; i < this.imageBuffer.length; i++) {
    //   let val = Unexplored;

    //   if (~tileData.buffer.get(i * 2) & playerVisionFlags) {
    //     val = Explored;
    //   }

    //   if (~tileData.buffer.get(i * 2 + 1) & playerVisionFlags) {
    //     val = Visible;
    //   }

    //   if (this.enabled) {
    //     if (val > this.imageBuffer[i]) {
    //       this.imageBuffer[i] = Math.min(
    //         val,
    //         this.imageBuffer[i] + this._revealSpeed
    //       );
    //     } else if (val < this.imageBuffer[i]) {
    //       this.imageBuffer[i] = Math.max(
    //         val,
    //         this.imageBuffer[i] - this._hideSpeed
    //       );
    //     }
    //   }

    //   this._toBuffer[i] = val;

    //   //alpha for minimap
    //   this.imageData.data[i * 4 - 1] = Math.max(50, 255 - val);
    // }

    this.playerVisionWasToggled = false;
  }

  get color() {
    return this.effect.color;
  }

  set color(val) {
    this.effect.color = val;
  }

  update(camera) {
    this.effect.projectionInverse.copy(camera.projectionMatrixInverse);
    this.effect.viewInverse.copy(camera.matrixWorld);
  }

  dispose() {
    this.worker.terminate();
  }
}
