import { Vector4 } from "three/src/math/Vector4";
import ClockMs from "titan-reactor-shared/utils/ClockMs";

const { PerspectiveCamera } = require("three");

export const PovLeft = Symbol("povLeft");
export const PovRight = Symbol("povRight");

// an instance of a players pov camera
export class PlayerPovCamera extends PerspectiveCamera {
  constructor(side, getActivePovs, { x = 0, y = 0 }) {
    super(30, 1, 5, 100);
    this.position.y = 40;
    this.side = side;
    this.enabled = false;
    this.getActivePovs = getActivePovs;
    this._clock = new ClockMs();
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

  update(cmd, pxToGameUnit, debounce = 0) {
    // some commands - screen move (right click, attack move, build, research, upgrade, pick up, drop)
    // some commands - minimap action (right click, attack move)
    // some commands - before hand was screen move (observing actions)

    if (this._clock.getElapsedTime() < debounce) {
      return;
    }
    this._clock.elapsedTime = 0;

    if (cmd.x && cmd.y) {
      this.position.x = pxToGameUnit.x(cmd.x);
      this.position.z = pxToGameUnit.y(cmd.y) + 5;
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
