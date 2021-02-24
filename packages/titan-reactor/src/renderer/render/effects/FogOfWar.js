import {
  ClampToEdgeWrapping,
  Color,
  DataTexture,
  LinearFilter,
  LuminanceFormat,
  UnsignedByteType,
  Vector2,
  Vector4,
} from "three";

const Unexplored = 25;
const Explored = 95;
const Visible = 255;

export default class FogOfWar {
  constructor(width, height, effect) {
    this.effect = effect;
    this.effect.worldOffset = new Vector2(width / 2, height / 2);

    const defaultImageData = new Uint8Array(width * height);
    defaultImageData.fill(Visible);
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
    this._enabled = val;
  }

  generate(tileData, players) {
    this._lastTileData = tileData;
    this._lastPlayers = players;

    if (this.enabled) {
      this.imageData.fill(Unexplored);
      for (let i = 0; i < this.imageData.length; i++) {
        for (let player of players) {
          //explored
          if ((~tileData.buffer[i * 4] & (1 << player)) !== 0) {
            this.imageData[i] = Explored;
            break;
          }
        }

        for (let player of players) {
          //visible
          if ((~tileData.buffer[i * 4 + 1] & (1 << player)) !== 0) {
            this.imageData[i] = Visible;
            break;
          }
        }
      }
    } else {
      this.imageData.fill(Visible);
    }

    this.texture.needsUpdate = true;
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
