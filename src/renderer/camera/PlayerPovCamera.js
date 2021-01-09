import { Vector4 } from "three/src/math/Vector4";

const { PerspectiveCamera } = require("three");

export const PovLeft = Symbol("povLeft");
export const PovRight = Symbol("povRight");

export class PlayerPovCamera extends PerspectiveCamera {
  constructor(side, getActivePovs, { x = 0, y = 0 }) {
    super(30, 1, 5, 100);
    this.position.y = 40;
    this.side = side;
    this.enabled = false;
    this.getActivePovs = getActivePovs;
    this.moveTo(x, y);
  }

  resizeViewport(width, height) {
    if (this.side === PovLeft) {
      this.viewport = new Vector4(0, 0, width / 2, height);
    } else {
      this.viewport = new Vector4(width / 2, 0, width / 2, height);
    }
  }

  moveTo(x, y) {
    this.position.x = x;
    this.position.z = y + 5;
    this.lookAt(this.position.x, 0, this.position.z);
  }

  update(cmd, pxToMeter) {
    // some commands - screen move (right click, attack move, build, research, upgrade, pick up, drop)
    // some commands - minimap action (right click, attack move)
    // some commands - before hand was screen move (observing actions)

    if (cmd.x && cmd.y) {
      this.position.x = pxToMeter.x(cmd.x);
      this.position.z = pxToMeter.y(cmd.y) + 5;
      this.lookAt(this.position.x, 0, this.position.z);
    }
    // switch (cmd.id) {
    //   case commands.rightClick:
    //   case commands.targetedOrder:
    //   case commands.build:
    // }
  }

  updateGameScreenAspect(width, height) {
    if (this.getActivePovs() === 0) {
      return;
    }

    this.aspect = width / this.getActivePovs() / height;
    this.resizeViewport(width, height);
    this.updateProjectionMatrix();
  }
}
