import {
  ClampToEdgeWrapping,
  DataTexture,
  LinearFilter,
  LuminanceFormat,
  UnsignedByteType,
  Vector2,
  Vector4,
} from "three";
import Worker from "./fog-of-war.worker.js";

import {
  Explored,
  HideSpeedSlow,
  Visible,
  RevealSpeed,
} from "./fog-of-war-shared";

// calculate fog of war tiles using webworkers

export default class FogOfWar {
  constructor(width, height, effect) {
    this.fogType = 0; // fade

    // for animation
    this._toBuffer = new Uint8Array(width * height);

    // for use with canvas drawing / minimap
    this.imageData = new ImageData(width, height);

    // for shader
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
    this.effect.fog = texture;
    this.effect.fogResolution = new Vector2(width, height);

    this.effect.fogUvTransform = new Vector4(0.5, 0.5, 1 / height, 1 / width);

    this.worker = new Worker();
    this.worker.onmessage = ({ data }) => {
      const { toBuffer, frame, imageData } = data;
      if (frame < this._lastFrame) return;
      this._lastFrame = frame;

      this.imageData = imageData;
      this._toBuffer = toBuffer;
    };
  }

  set imageBuffer(val) {
    this.texture.image.data = val;
  }

  get imageBuffer() {
    return this.texture.image.data;
  }

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
