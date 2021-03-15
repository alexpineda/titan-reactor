import create from "../../../libs/zustand";

let _productionInterval = null;
let _cycleTime = 10000;
const _minCycleTime = 10000;

const useHudStore = create((set, get) => ({
  show: {
    inGameMenu: false,
    fps: true,
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
  toggleProductionView: (val) => {
    if (val) {
      set({ productionView: val });
    } else {
      set({ productionView: (get().productionView + 1) % 4 });
    }
  },
  setAutoProductionView: (v) => {
    if (v) {
      get().startTogglingProduction();
    } else {
      get().stopTogglingProduction();
    }
    return v;
  },
  onTechNearComplete: () => {
    // only do this if we have auto toggling on
    if (!_productionInterval || _cycleTime > _minCycleTime) return;

    set({ productionView: 2 });
    _cycleTime = _minCycleTime * 1.25;
    get().startTogglingProduction();
  },
  onUpgradeNearComplete: () => {
    // only do this if we have auto toggling on and we're not already doing this
    if (!_productionInterval || _cycleTime > _minCycleTime) return;
    set({ productionView: 3 });
    get().startTogglingProduction();
    _cycleTime = _minCycleTime * 1.25;
  },
  startTogglingProduction: () => {
    clearTimeout(_productionInterval);
    const fn = () => {
      let nextProductionView = get().productionView + 1;
      if (nextProductionView === 2 && !get().hasTech) {
        nextProductionView++;
      }
      if (nextProductionView === 3 && !get().hasUpgrades) {
        nextProductionView++;
      }
      nextProductionView = nextProductionView % 4;

      const timeModifier = nextProductionView === 0 ? 1 : 3 / 5;

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
    _productionInterval = null;
  },
  toggleInGameMenu: () => {
    set({ show: { ...get().show, inGameMenu: !get().show.inGameMenu } });
  },
  toggleUnitDetails: () => {
    set({ show: { ...get().show, unitDetails: !get().show.unitDetails } });
  },
  toggleAttackDetails: () => {
    set({ show: { ...get().show, attackDetails: !get().show.attackDetails } });
  },
  hoveringOverMinimap: false,
}));

export default useHudStore;

/**
 * const { frame, camera, note } = action.payload;
        let nearbyFrame;

        if (!state.bookmarks[frame]) {
          nearbyFrame = Object.keys(state.bookmarks).find(
            (i) => i >= frame - 420 || i <= frame + 420
          );
        }
        if (nearbyFrame !== undefined) {
          state.bookmarks[nearbyFrame] = { camera, note, frame: nearbyFrame };
        } else {
          state.bookmarks[frame] = { camera, note, frame };
        }
        */
