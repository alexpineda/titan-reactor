import useGameStore from "../../stores/gameStore";
import useUnitSelectionStore from "../../stores/realtime/unitSelectionStore";
import useProductionStore from "../../stores/realtime/productionStore";
import useResourcesStore from "../../stores/realtime/resourcesStore";

const setSelectedUnits = useUnitSelectionStore.getState().setSelectedUnits;
const setAllProduction = useProductionStore.getState().setAllProduction;
const setAllResources = useResourcesStore.getState().setAllResources;

/**
 * Usually fast changing data like minerals, supply, where we don't want to go through redux/react
 */
export default class ManagedDomElements {
  /**
   *
   * @param {FrameBW} currentBwFrame
   * @param {GameStatePosition} gameStatePosition
   * @param {Players} players
   */
  update(currentBwFrame, gameStatePosition, players, apm, frameBuilder) {
    setAllResources(
      currentBwFrame.minerals,
      currentBwFrame.gas,
      currentBwFrame.supplyUsed,
      currentBwFrame.supplyAvailable,
      currentBwFrame.workerSupply,
      apm,
      gameStatePosition.getFriendlyTime()
    );

    setAllProduction(
      frameBuilder.unitsInProduction,
      frameBuilder.research,
      frameBuilder.upgrades
    );
    setSelectedUnits(useGameStore.getState().selectedUnits);

    frameBuilder.unitsInProduction.needsUpdate = false;
    frameBuilder.upgrades.needsUpdate = false;
    frameBuilder.research.needsUpdate = false;
  }
}
