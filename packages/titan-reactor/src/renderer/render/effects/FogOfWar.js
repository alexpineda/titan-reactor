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
const Explored = 70;
const Visible = 255;
const RevealSpeed = 10;
const HideSpeedSlow = 5;

export default class FogOfWar {
  constructor(width, height, effect) {
    this.effect = effect;
    this.effect.worldOffset = new Vector2(width / 2, height / 2);

    const defaultImageData = new Uint8Array(width * height);
    // defaultImageData.fill(Visible);

    this.fogType = 0; // fade

    // for animation
    this._toBuffer = new Uint8Array(width * height);

    this._fromBuffer = new Uint8Array(width * height);

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
    this.fogResolution = new Vector2(width, height);
    this.size = new Vector2(width, height);
    this.scale = 1;
    this.color = new Color(1, 1, 1);
    this._enabled = true;
    this.effect.fog = texture;
    this._setUvTransform();

    this._revealSpeed = RevealSpeed;
    this._hideSpeed = HideSpeedSlow;
  }

  set imageData(val) {
    this.texture.image.data = val;
  }

  get imageData() {
    return this.texture.image.data;
  }

  _setUvTransform() {
    const width = this.fogResolution.x;
    const height = this.fogResolution.y;

    const scaleX = this.scale * this.size.x * (width / (width - 3));
    const scaleY = this.scale * this.size.y * (height / (height - 3));

    const offsetX = 1.5 / width;
    const offsetY = 1.5 / height;

    // this.fogUvTransform = new Vector4(offsetX, offsetY, 1 / scaleX, 1 / scaleY);
    this.fogUvTransform = new Vector4(0, 0, 1 / this.size.x, 1 / this.size.y);
  }

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

  generate(frame, tileData, players) {
    this._lastTileData = tileData;
    this._lastPlayers = players;

    this._toBuffer.fill(Unexplored);
    for (let i = 0; i < this.imageData.length; i++) {
      for (let player of players) {
        //explored
        if ((~tileData.buffer[i * 4] & (1 << player)) !== 0) {
          this._toBuffer[i] = Explored;
          break;
        }
      }

      for (let player of players) {
        //visible
        if ((~tileData.buffer[i * 4 + 1] & (1 << player)) !== 0) {
          this._toBuffer[i] = Visible;
          break;
        }
      }
    }

    if (this.enabled) {
      for (let i = 0; i < this.imageData.length; i++) {
        if (this._toBuffer[i] > this.imageData[i]) {
          this.imageData[i] = Math.min(
            this._toBuffer[i],
            this.imageData[i] + this._revealSpeed
          );
        } else if (this._toBuffer[i] < this.imageData[i]) {
          this.imageData[i] = Math.max(
            this._toBuffer[i],
            this.imageData[i] - this._hideSpeed
          );
        }
      }
      this.texture.needsUpdate = true;
    }
  }

  get color() {
    return this.effect.color;
  }

  set color(val) {
    this.effect.color = val;
  }

  get fogUvTransform() {
    return this.effect.fogUvTransform;
  }

  set fogUvTransform(val) {
    this.effect.fogUvTransform = val;
  }

  get fogResolution() {
    return this.effect.fogResolution;
  }

  set fogResolution(val) {
    this.effect.fogResolution = val;
  }

  update(camera) {
    this.effect.projectionInverse.copy(camera.projectionMatrixInverse);
    this.effect.viewInverse.copy(camera.matrixWorld);
  }
}
