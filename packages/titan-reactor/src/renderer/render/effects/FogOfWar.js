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

export default class FogOfWar {
  constructor(width, height, effect) {
    this.effect = effect;
    const texture = new DataTexture(
      new Uint8Array(width * height),
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
    this.color = new Color(0.1, 0.1, 0.1);
    this._enabled = true;
    this.effect.fog = texture;
  }

  _setUvTransform() {
    const width = this.fogResolution.x;
    const height = this.fogResolution.y;

    const scaleX = this.scale * this.size.x * (width / (width - 3));
    const scaleY = this.scale * this.size.y * (height / (height - 3));

    const offsetX = 1.5 / width;
    const offsetY = 1.5 / height;

    this.fogUvTransform = new Vector4(offsetX, offsetY, 1 / scaleX, 1 / scaleY);
  }

  get enabled() {
    return this._enabled;
  }

  set enabled(val) {
    this._enabled = val;
    this.generate(this._lastTileData, this._lastPlayers);
  }

  generate(tileData, players) {
    this._lastTileData = tileData;
    this._lastPlayers = players;

    const data = new Uint8Array(this.fogResolution.x * this.fogResolution.y);

    if (!this.enabled) {
      data.fill(255);
    } else {
      let idx = 0;
      for (const tile of tileData.items()) {
        for (let player of players) {
          if (tile.visible & (1 << player === 0)) {
            data[idx] = 255;
            break;
          }
          if (tile.explored & (1 << player === 0)) {
            data[idx] = 155;
            break;
          }
        }
        idx++;
      }
    }

    this.data = data;
  }

  set data(value) {
    this.texture.image.data = value;
    this.texture.needsUpdate = true;
  }

  get data() {
    return this.texture.image.data;
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
