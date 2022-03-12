import create from "zustand";

let _productionInterval: NodeJS.Timeout;
let _cycleTime = 10000;
const _minCycleTime = 10000;

export const ResourcesView = 0;
export const UnitProductionView = 1;
export const TechProductionView = 2;
export const UpgradesProductionView = 3;

export type HudStore = {
  show: {
    inGameMenu: boolean;
    replayControls: boolean;
    unitSelection: boolean;
    unitDetails: boolean;
    attackDetails: boolean;
  };
  hasTech: boolean;
  hasUpgrades: boolean;
  productionView: number;
  hoveringOverMinimap: boolean;
  toggleProductionView: (productionView: number) => void;
  setAutoProductionView: (enabled: boolean) => boolean;
  onTechNearComplete: () => void;
  onUpgradeNearComplete: () => void;
  startTogglingProduction: () => void;
  stopTogglingProduction: () => void;
  toggleInGameMenu: () => void;
  toggleUnitDetails: () => void;
  toggleAttackDetails: () => void;
};

export const useHudStore = create<HudStore>((set, get) => ({
  show: {
    inGameMenu: false,
    replayControls: true,
    unitSelection: true,
    unitDetails: false,
    attackDetails: false,
  },
  // for auto toggle, whether there is anything to show
  hasTech: false,
  hasUpgrades: false,

  productionView: 0,
  // resources, units, upgrades, research
  toggleProductionView: (val: number) => {
    if (val) {
      set({ productionView: val });
    } else {
      set((state) => ({ productionView: (state.productionView + 1) % 4 }));
    }
  },
  setAutoProductionView: (enabled: boolean) => {
    if (enabled) {
      get().startTogglingProduction();
    } else {
      get().stopTogglingProduction();
    }
    return enabled;
  },
  onTechNearComplete: () => {
    // only do this if we have auto toggling on
    if (!_productionInterval || _cycleTime > _minCycleTime) return;

    set({ productionView: TechProductionView });
    _cycleTime = _minCycleTime * 1.25;
    get().startTogglingProduction();
  },
  onUpgradeNearComplete: () => {
    // only do this if we have auto toggling on and we're not already doing this
    if (!_productionInterval || _cycleTime > _minCycleTime) return;
    set({ productionView: UpgradesProductionView });
    get().startTogglingProduction();
    _cycleTime = _minCycleTime * 1.25;
  },
  startTogglingProduction: () => {
    clearTimeout(_productionInterval);
    const fn = () => {
      clearTimeout(_productionInterval);

      let nextProductionView = get().productionView + 1;
      if (nextProductionView === TechProductionView && !get().hasTech) {
        nextProductionView++;
      }
      if (nextProductionView === UpgradesProductionView && !get().hasUpgrades) {
        nextProductionView++;
      }
      nextProductionView = nextProductionView % 4;

      let timeModifier = 1;
      if (nextProductionView === UnitProductionView) {
        timeModifier = 3 / 5;
      } else if (
        nextProductionView === UpgradesProductionView ||
        nextProductionView === TechProductionView
      ) {
        timeModifier = 1 / 2;
      }

      set({ productionView: nextProductionView });
      if (_cycleTime > _minCycleTime) {
        _cycleTime = _minCycleTime;
      }
      _productionInterval = setTimeout(fn, _cycleTime * timeModifier);
    };
    _productionInterval = setTimeout(fn, _cycleTime);
  },
  stopTogglingProduction: () => {
    clearTimeout(_productionInterval);
    //@ts-ignore
    _productionInterval = null;
  },
  toggleInGameMenu: () => {
    set((state) => ({
      show: { ...state.show, inGameMenu: !state.show.inGameMenu },
    }));
  },
  toggleUnitDetails: () => {
    set((state) => ({
      show: { ...state.show, unitDetails: !state.show.unitDetails },
    }));
  },
  toggleAttackDetails: () => {
    set((state) => ({
      show: { ...state.show, attackDetails: !state.show.attackDetails },
    }));
  },
  hoveringOverMinimap: false,
}));

export default useHudStore;
