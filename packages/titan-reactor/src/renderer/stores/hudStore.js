import create from "../../../libs/zustand";
const useHudStore = create((set, get) => ({
  show: {
    inGameMenu: false,
    fps: true,
    replayControls: true,
    unitSelection: true,
    unitDetails: false,
    attackDetails: false,
  },
  production: {
    unitsInProduction: [],
    cycleVisible: false,
    currentlyVisible: 0,
  },
  updateUnitsInProduction: (unitsInProduction) =>
    set({ production: { ...get().production, unitsInProduction } }),
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
