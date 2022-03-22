import create from "zustand/vanilla";
import { UnitDAT } from "../../common/bwdat/units-dat";
import range from "../../common/utils/range";
import { Unit } from "../core";

export type ToggleStore = {
    fogOfWar: boolean;
    followUnit: Unit | null;
    selectedUnits: Unit[];
    playerVision: boolean[];
    setSelectedUnits: (unit: Unit[]) => void;
    selectOfType: (type: UnitDAT) => void;
    toggleFogOfWar: () => void;
    togglePlayerVision: (id: number) => void;
    toggleFollowUnit: (unit: Unit) => void;
};

export const useToggleStore = create<ToggleStore>((set, get) => ({
    fogOfWar: true,
    followUnit: null,
    selectedUnits: [],
    playerVision: range(0, 8).map(() => true),
    setSelectedUnits: (selectedUnits: Unit[]) => {
        for (const unit of get().selectedUnits) {
            unit.extra.selected = false;
        }

        for (const unit of selectedUnits) {
            unit.extra.selected = true;
        }

        set({ selectedUnits });
    },
    selectOfType: (ut) =>
        get().setSelectedUnits(
            get().selectedUnits.filter(({ extra: { dat: unitType } }) => unitType === ut)
        ),
    toggleFogOfWar: () => set((state) => ({ fogOfWar: !state.fogOfWar })),
    togglePlayerVision: (id) =>
        set((state) => ({
            playerVision: state.playerVision.map((v, i) => (i === id ? !v : v)),
        })),
    toggleFollowUnit: (unit: Unit) => set({ followUnit: unit }),
}));

export default () => useToggleStore.getState();

