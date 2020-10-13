import { commands } from "bwdat/commands";
import { Vector4 } from "three/src/math/Vector4";

const { PerspectiveCamera } = require("three");

export class PlayerPovCamera extends PerspectiveCamera {
  constructor(player) {
    super(30, window.innerWidth / 2 / window.innerHeight, 5, 100);
    this.initViewport(player);
    this.position.y = 40;
  }

  initViewport(player) {
    if (player === 0) {
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
}
