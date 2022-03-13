import { AssetTextureResolution, ImageDAT } from "common/types";
import { loadAnimAtlas } from "../image";
import {
    readCascFile,
} from "common/utils/casclib";
import { UnitTileScale } from "../core";

export default async function (res: AssetTextureResolution) {
    const selectionCirclesHD = [];
    for (let i = 561; i < 571; i++) {
        const pre = res === AssetTextureResolution.HD2 ? "HD2/" : "";
        const scale = res === AssetTextureResolution.HD2 ? UnitTileScale.HD2 : UnitTileScale.HD;

        const readAnim = async () => await readCascFile(`${pre}anim/main_${i}.anim`);

        const selCircleGRP = await loadAnimAtlas(
            readAnim,
            { index: i } as ImageDAT,
            scale,
            {
                w: 0,
                h: 0,
                frames: [],
                maxFrameH: 0,
                maxFramew: 0
            }
        )

        selectionCirclesHD.push(selCircleGRP);
    }
    return selectionCirclesHD;
}