import { range } from "ramda";
import RollingNumber from "./RollingNumber";
import BasicElement from "./BasicElement";
import UnitProductionWrapperElement from "./UnitProductionWrapperElement";

/**
 * Usually fast changing data like minerals, supply, where we don't want to go through redux/react
 */
export default class ManagedDomElements {
  constructor(cmdIcons, players) {
    this.minerals = range(0, 8).map(() => new RollingNumber());
    this.gas = range(0, 8).map(() => new RollingNumber());
    this.apm = range(0, 8).map(() => new RollingNumber());
    this.supply = range(0, 8).map(() => new BasicElement());
    this.workerSupply = range(0, 8).map(() => new BasicElement());
    this.timeLabel = new BasicElement();
    this.production = range(0, 8).map(
      (i) =>
        new UnitProductionWrapperElement(
          cmdIcons,
          players[i] ? players[i].color.hex : ""
        )
    );
  }

  /**
   *
   * @param {FrameBW} frame
   * @param {GameStatePosition} gameStatePosition
   * @param {Players} players
   */
  update(frame, gameStatePosition, players, unitsInProduction) {
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
      this.production[player.id].length = 0;
    }
    for (const player of players) {
      this.apm[player.id].value = player.apm;

      if (unitsInProduction.needsUpdate) {
        const units = unitsInProduction
          .filter((u) => u.ownerId === player.id)
          .slice(0, 10);
        for (let i = 0; i < 10; i++) {
          this.production[player.id].units[i].value = units[i];
        }
      }
    }
    unitsInProduction.needsUpdate = false;
  }
}
