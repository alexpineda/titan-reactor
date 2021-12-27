import { PerspectiveCamera } from "three";
import { Vector4 } from "three/src/math/Vector4";

import { cmdIsRightClick, ReplayCommand } from "../../common/types/replay";
import { PxToGameUnit } from "../../common/types/util";
import Clock from "../../common/utils/clock";

export const PovLeft = Symbol("povLeft");
export const PovRight = Symbol("povRight");

export enum Side {
  Left,
  Right,
}

// an instance of a players pov camera
export class PlayerPovCamera extends PerspectiveCamera {
  side: Side;
  enabled = false;
  private _clock: Clock;
  viewport = new Vector4();
  getActivePovs: () => number;

  constructor(side: Side, getActivePovs: () => number, { x = 0, y = 0 }) {
    super(30, 1, 5, 100);
    this.position.y = 40;
    this.side = side;
    this.getActivePovs = getActivePovs;
    this._clock = new Clock();
    this.moveTo(x, y);
  }

  resizeViewport(width: number, height: number) {
    if (this.side === Side.Left) {
      this.viewport = new Vector4(0, 0, width / 2, height);
    } else {
      this.viewport = new Vector4(width / 2, 0, width / 2, height);
    }
  }

  moveTo(x: number, y: number) {
    this.position.x = x;
    this.position.z = y + 5;
    this.lookAt(this.position.x, 0, this.position.z);
  }

  update(cmd: ReplayCommand, pxToGameUnit: PxToGameUnit, debounce = 0) {
    // some commands - screen move (right click, attack move, build, research, upgrade, pick up, drop)
    // some commands - minimap action (right click, attack move)
    // some commands - before hand was screen move (observing actions)

    if (this._clock.getElapsedTime() < debounce) {
      return;
    }
    this._clock.elapsedTime = 0;

    if (cmdIsRightClick(cmd))
      if (cmd.x && cmd.y) {
        this.position.x = pxToGameUnit.x(cmd.x);
        this.position.z = pxToGameUnit.y(cmd.y) + 5;
        this.lookAt(this.position.x, 0, this.position.z);
      }
  }

  updateGameScreenAspect(width: number, height: number) {
    if (this.getActivePovs() === 0) {
      return;
    }

    this.aspect = width / this.getActivePovs() / height;
    this.resizeViewport(width, height);
    this.updateProjectionMatrix();
  }
}
