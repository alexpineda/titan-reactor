import { easeExpOut, easeLinear, easeQuadIn, easeQuadOut } from "d3-ease";
import {
  ClampToEdgeWrapping,
  Color,
  DataTexture,
  LinearFilter,
  LuminanceFormat,
  MathUtils,
  UnsignedByteType,
  Vector2,
  Vector4,
} from "three";

const Unexplored = 15;
const Explored = 50;
const Visible = 255;
const RevealSpeed = 10;
const HideSpeedSlow = 5;

export default class FogOfWar {
  constructor(width, height, effect) {
    const defaultImageData = new Uint8Array(width * height);

    this.fogType = 0; // fade

    // for animation
    this._toBuffer = new Uint8Array(width * height);

    const texture = new DataTexture(
      defaultImageData,
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
  }

  set imageData(val) {
    this.texture.image.data = val;
  }

  get imageData() {
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
      this.imageData = this._toBuffer.slice(0);
    } else {
      this.imageData.fill(Visible);
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
    return this.imageData[y * this.width + x] > Explored;
  }

  isSomewhatExplored(x, y) {
    return this.imageData[y * this.width + x] > 0;
  }

  generate(tileData, playerVisionFlags) {
    this._lastTileData = tileData;
    this._lastPlayers = playerVisionFlags;

    for (let i = 0; i < this.imageData.length; i++) {
      let val = Unexplored;

      if (~tileData.buffer.get(i * 2) & playerVisionFlags) {
        val = Explored;
      }

      if (~tileData.buffer.get(i * 2 + 1) & playerVisionFlags) {
        val = Visible;
      }

      if (this.enabled) {
        if (val > this.imageData[i]) {
          this.imageData[i] = Math.min(
            val,
            this.imageData[i] + this._revealSpeed
          );
        } else if (val < this.imageData[i]) {
          this.imageData[i] = Math.max(
            val,
            this.imageData[i] - this._hideSpeed
          );
        }
      }

      this._toBuffer[i] = val;
    }

    if (this.enabled) {
      //instantly reveal if player vision has toggled
      if (this.playerVisionWasToggled) {
        this.imageData = this._toBuffer.slice(0);
      }
      this.texture.needsUpdate = true;
    }

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
}
