import { Vector4 } from "three/src/math/Vector4";

const { PerspectiveCamera } = require("three");

export const PovLeft = Symbol("povLeft");
export const PovRight = Symbol("povRight");

export class PlayerPovCamera extends PerspectiveCamera {
  constructor(side, getActivePovs, { x = 0, y = 0 }) {
    super(30, window.innerWidth / 2 / window.innerHeight, 5, 100);
    this.position.y = 40;
    this.side = side;
    this.enabled = false;
    this.getActivePovs = getActivePovs;
    this.resizeViewport();
    this.moveTo(x, y);
  }

  resizeViewport() {
    if (this.side === PovLeft) {
      this.viewport = new Vector4(
        0,
        0,
        window.innerWidth / 2,
        window.innerHeight
      );
    } else {
      this.viewport = new Vector4(
        window.innerWidth / 2,
        0,
        window.innerWidth / 2,
        window.innerHeight
      );
    }
  }

  moveTo(x, y) {
    this.position.x = x;
    this.position.z = y;
    this.lookAt(this.position.x, 0, this.position.z);
  }

  update(cmd, pxToMeter) {
    // some commands - screen move (right click, attack move, build, research, upgrade, pick up, drop)
    // some commands - minimap action (right click, attack move)
    // some commands - before hand was screen move (observing actions)

    if (cmd.x && cmd.y) {
      this.position.x = pxToMeter.x(cmd.x);
      this.position.z = pxToMeter.y(cmd.y);
      this.lookAt(this.position.x, 0, this.position.z);
    }
    // switch (cmd.id) {
    //   case commands.rightClick:
    //   case commands.targetedOrder:
    //   case commands.build:
    // }
  }

  updateAspect(width, height) {
    if (this.getActivePovs() === 0) {
      return;
    }

    this.aspect = width / this.getActivePovs() / height;
    this.resizeViewport();
    this.updateProjectionMatrix();
  }
}
