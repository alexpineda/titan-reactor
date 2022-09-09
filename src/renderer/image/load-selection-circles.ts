import { UnitTileScale } from "common/types";
import { loadAnimAtlas } from ".";
import {
    readCascFile,
} from "@utils/casclib";

export default async function (res: UnitTileScale) {
    const selectionCirclesHD = [];
    for (let i = 561; i < 571; i++) {
        const pre = res === UnitTileScale.HD2 ? "HD2/" : "";
        const scale = res === UnitTileScale.HD2 ? UnitTileScale.HD2 : UnitTileScale.HD;

        const selCircleGRP = await loadAnimAtlas(
            await readCascFile(`${pre}anim/main_${i}.anim`),
            i,
            scale,
        )

        selectionCirclesHD.push(selCircleGRP);
    }
    return selectionCirclesHD;
}