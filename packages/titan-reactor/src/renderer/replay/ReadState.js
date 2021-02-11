import SpriteBW from "./SpriteBW";
import ImageBW from "./ImageBW";

export default class ReadState {
  static get Frame() {
    return 0;
  }

  static get Sprite() {
    return 1;
  }

  static get Images() {
    return 2;
  }

  constructor() {
    this.mode = ReadState.Frame;
    this.frame = 0;
  }

  process(buf) {
    if (this.mode === ReadState.Frame) {
      if (buf.length < 4) {
        return;
      }
      this.sprites = [];
      this.frame = buf.readInt32LE(0);
      buf.consume(4);
      this.mode = ReadState.Sprite;
      return true;
    }

    if (this.mode === ReadState.Sprite) {
      if (buf.length < SpriteBW.byteLength) {
        return;
      }

      this.sprite = new SpriteBW(buf.shallowSlice(0, SpriteBW.byteLength));
      this.sprites.push(this.sprite);
      buf.consume(SpriteBW.byteLength);
      if (this.sprite.numImages) {
        this.mode = ReadState.Images;
      }
      return true;
    }

    if (this.mode === ReadState.Images) {
      if (buf.length < ImageBW.byteLength) {
        return;
      }
      this.sprite.images.push(
        new ImageBW(buf.shallowSlice(0, ImageBW.byteLength))
      );
      buf.consume(ImageBW.byteLength);

      if (this.sprite.images.length === this.sprite.numImages) {
        this.mode = ReadState.Frame;
      }
      return true;
    }

    return false;
  }
}
