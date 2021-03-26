import { range } from "ramda";
import RollingNumber from "./RollingNumber";
import BasicElement from "./BasicElement";
import ProductionWrapperElement from "./ProductionWrapperElement";
import LargeUnitDetailElement from "./LargeUnitDetailElement";
import SmallUnitDetailWrapperElement from "./SmallUnitDetailWrapperElement";
import useGameStore from "../../stores/gameStore";
import useRealtimeStore from "../../stores/realtimeStore";

const setSelectedUnits = useRealtimeStore.getState().setSelectedUnits;

/**
 * Usually fast changing data like minerals, supply, where we don't want to go through redux/react
 */
export default class ManagedDomElements {
  constructor(bwDat, cmdIcons, wireframeIcons, gameIcons, players) {
    this.wireframeIcons = wireframeIcons;
    this.unitDetail = new LargeUnitDetailElement(
      bwDat,
      cmdIcons,
      wireframeIcons,
      gameIcons
    );
    this.unitDetails = new SmallUnitDetailWrapperElement(wireframeIcons);
    this.minerals = range(0, 8).map(() => new RollingNumber());
    this.gas = range(0, 8).map(() => new RollingNumber());
    this.apm = range(0, 8).map(() => new RollingNumber());
    this.supply = range(0, 8).map(() => new BasicElement());
    this.workerSupply = range(0, 8).map(() => new BasicElement());
    this.timeLabel = new BasicElement();
    this.production = range(0, 8).map(
      (i) =>
        new ProductionWrapperElement(
          cmdIcons,
          players[i] ? players[i].color.hex : "",
          true
        )
    );

    this.research = range(0, 8).map(
      (i) =>
        new ProductionWrapperElement(
          cmdIcons,
          players[i] ? players[i].color.hex : ""
        )
    );

    this.upgrades = range(0, 8).map(
      (i) =>
        new ProductionWrapperElement(
          cmdIcons,
          players[i] ? players[i].color.hex : ""
        )
    );
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

      if (frameBuilder.unitsInProduction.needsUpdate) {
        const units = frameBuilder.unitsInProduction
          .filter((u) => u.ownerId === player.id)
          .slice(0, 10);

        for (let i = 0; i < 10; i++) {
          this.production[player.id].items[i].value = units[i];
        }
      }

      if (frameBuilder.research.needsUpdate) {
        for (let i = 0; i < 10; i++) {
          const owner = frameBuilder.research[player.id];
          if (owner) {
            this.research[player.id].items[i].value =
              frameBuilder.research[player.id][i];
          }
        }
      }

      if (frameBuilder.upgrades.needsUpdate) {
        for (let i = 0; i < 10; i++) {
          const owner = frameBuilder.upgrades[player.id];
          if (owner) {
            this.upgrades[player.id].items[i].value =
              frameBuilder.upgrades[player.id][i];
          }
        }
      }
    }

    if (selectedUnits.length === 1) {
      // this.unitDetail.value = selectedUnits[0];
      setSelectedUnits(selectedUnits);
    } else if (selectedUnits.length > 1) {
      for (let i = 0; i < 12; i++) {
        this.unitDetails.items[i].value = selectedUnits[i];
      }
      this.unitDetails.updateKillCount(selectedUnits);
    }

    frameBuilder.unitsInProduction.needsUpdate = false;
    frameBuilder.upgrades.needsUpdate = false;
    frameBuilder.research.needsUpdate = false;
  }

  dispose() {
    this.selectedUnitsUnsub();
  }
}
