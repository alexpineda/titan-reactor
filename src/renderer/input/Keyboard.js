export const Keys = {
  A: 0,
};

export const Modifiers = {
  alt: 0,
  shift: 1,
  ctrl: 0,
};

//event to polling
export class Keyboard {
  constructor(domElement) {
    this.domElement = domElement;
  }

  esc() {}

  shift() {}

  ctrl() {}

  alt() {}

  key() {}

  keyRelease() {}

  keyHeld() {}

  combo() {}
}
