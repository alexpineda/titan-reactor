import { range } from "ramda";
import RollingNumberDOM from "../react-ui/game/RollingNumberDOM";

class BasicElement {
  constructor() {
    this.domElement = document.createElement("span");
    this.value = "";
  }

  set value(val) {
    this._value = val;
    this.domElement.innerText = val;
  }

  get value() {
    return this._value;
  }
}

/**
 * Usually fast changing data like minerals, supply, where we don't want to go through redux/react
 */
export default class ManagedDomElements {
  constructor() {
    this.minerals = range(0, 8).map(() => new RollingNumberDOM());
    this.gas = range(0, 8).map(() => new RollingNumberDOM());
    this.apm = range(0, 8).map(() => new RollingNumberDOM());
    this.supply = range(0, 8).map(() => new BasicElement());
    this.workerSupply = range(0, 8).map(() => new BasicElement());
    this.timeLabel = new BasicElement();
  }

  /**
   *
   * @param {FrameBW} frame
   * @param {GameStatePosition} gameStatePosition
   * @param {Players} players
   */
  update(frame, gameStatePosition, players) {
    for (let i = 0; i < 8; i++) {
      this.minerals[i].value = frame.minerals[i];
      this.gas[i].value = frame.gas[i];
      this.supply[
        i
      ].value = `${frame.supplyUsed[i]} / ${frame.supplyAvailable[i]}`;
      this.workerSupply[i].value = frame.workerSupply[i];
    }
    this.timeLabel.value = gameStatePosition.getFriendlyTime();

    for (const player of players) {
      this.apm[player.id].value = player.apm;
    }
  }
}
