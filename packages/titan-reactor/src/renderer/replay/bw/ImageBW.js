const flags = Object.freeze({
  redraw: 1,
  flipped: 2,
  frozen: 4,
  directional: 8,
  iscript: 0x10,
  clickable: 0x20,
  hidden: 0x40,
  specialOffset: 0x80,
});

export default class ImagesBW {
  static flipped(imageBw) {
    return (imageBw.flags & flags.flipped) != 0;
  }

  constructor(buf) {
    this.buf = buf;
  }

  get(index) {}
}
