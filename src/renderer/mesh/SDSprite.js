import {
  BufferGeometry,
  InterleavedBuffer,
  InterleavedBufferAttribute,
  Mesh,
  Vector2,
} from "three";

export class SDSprite extends Mesh {
  constructor(material) {
    const geo = new BufferGeometry();

    const float32Array = new Float32Array([
      -0.5,
      -0.5,
      0,
      0,
      0,
      0.5,
      -0.5,
      0,
      1,
      0,
      0.5,
      0.5,
      0,
      1,
      1,
      -0.5,
      0.5,
      0,
      0,
      1,
    ]);

    const interleavedBuffer = new InterleavedBuffer(float32Array, 5);

    geo.setIndex([0, 1, 2, 0, 2, 3]);
    geo.setAttribute(
      "position",
      new InterleavedBufferAttribute(interleavedBuffer, 3, 0, false)
    );
    geo.setAttribute(
      "uv",
      new InterleavedBufferAttribute(interleavedBuffer, 2, 3, false)
    );

    super(geo, material);
    this.center = new Vector2(0.5, 0.5);
  }
}
