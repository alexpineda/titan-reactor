import { SpriteRAW } from "../sprite-raw";
import BufferView from "./buffer-view";

export const STRUCT_SIZE = 17;
export class SpritesBW
  extends BufferView<SpriteRAW>
  implements SpriteRAW
{
  get default() {
    return this.containerIndex;
  }

  get containerIndex() {
    return this._read(0);
  }

  get id() {
    return this._read(1);
  }

  get owner() {
    return this._read(2);
  }

  get elevation() {
    return this._read(3);
  }

  get flags() {
    return this._read(4);
  }

  get x() {
    return this._read(5);
  }

  get y() {
    return this._read(6);
  }

  get imageCount() {
    return this._read(7);
  }

  get mainImageIndex() {
    return this._read(8);
  }

  get order() {
    return this.containerIndex;
  }

  get tileX() {
    return Math.floor(this.x / 32);
  }

  get tileY() {
    return Math.floor(this.y / 32);
  }

}
export default SpritesBW;
