import create from "zustand/vanilla";
import { UnitDAT } from "common/bwdat/units-dat";
import range from "common/utils/range";
import { Unit } from "@core";

export type ToggleStore = {
    selectedUnits: Unit[];
    playerVision: boolean[];
    setSelectedUnits: (unit: Unit[]) => void;
    selectOfType: (type: UnitDAT) => void;
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
    // togglePlayerVision: (id) =>
    //     set((state) => ({
    //         playerVision: state.playerVision.map((v, i) => (i === id ? !v : v)),
    //     })),
}));

export default () => useToggleStore.getState();

