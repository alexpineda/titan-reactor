import { range } from "ramda";
import RollingNumber from "./RollingNumber";
import BasicElement from "./BasicElement";
import useGameStore from "../../stores/gameStore";
import useUnitSelectionStore from "../../stores/realtime/unitSelectionStore";
import useProductionStore from "../../stores/realtime/productionStore";

const setSelectedUnits = useUnitSelectionStore.getState().setSelectedUnits;
const setAllProduction = useProductionStore.getState().setAllProduction;

/**
 * Usually fast changing data like minerals, supply, where we don't want to go through redux/react
 */
export default class ManagedDomElements {
  constructor(bwDat, cmdIcons, wireframeIcons, gameIcons, players) {
    this.wireframeIcons = wireframeIcons;

    this.minerals = range(0, 8).map(() => new RollingNumber());
    this.gas = range(0, 8).map(() => new RollingNumber());
    this.apm = range(0, 8).map(() => new RollingNumber());
    this.supply = range(0, 8).map(() => new BasicElement());
    this.workerSupply = range(0, 8).map(() => new BasicElement());
    this.timeLabel = new BasicElement();
  }

  /**
   *
   * @param {FrameBW} currentBwFrame
   * @param {GameStatePosition} gameStatePosition
   * @param {Players} players
   */
  update(currentBwFrame, gameStatePosition, players, apm, frameBuilder) {
    const selectedUnits = useGameStore.getState().selectedUnits;

    for (let i = 0; i < 8; i++) {
      this.minerals[i].value = currentBwFrame.minerals[i];
      this.gas[i].value = currentBwFrame.gas[i];
      this.supply[
        i
      ].value = `${currentBwFrame.supplyUsed[i]} / ${currentBwFrame.supplyAvailable[i]}`;
      this.workerSupply[i].value = currentBwFrame.workerSupply[i];
    }
    this.timeLabel.value = gameStatePosition.getFriendlyTime();

    for (const player of players) {
      this.apm[player.id].value = apm[player.id];
    }

    setAllProduction(
      frameBuilder.unitsInProduction,
      frameBuilder.research,
      frameBuilder.upgrades
    );
    setSelectedUnits(selectedUnits);

    frameBuilder.unitsInProduction.needsUpdate = false;
    frameBuilder.upgrades.needsUpdate = false;
    frameBuilder.research.needsUpdate = false;
  }

  dispose() {}
}
