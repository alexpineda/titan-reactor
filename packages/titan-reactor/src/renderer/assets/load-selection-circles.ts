import { AssetTextureResolution } from "../../common/types";
import { Anim } from "../../common/image";
import {
    readCascFile,
} from "../../common/utils/casclib";
import {
    updateLoadingProcess,
} from "../stores";

export default async function (res: AssetTextureResolution) {
    const selectionCirclesHD = [];
    for (let i = 561; i < 571; i++) {
        const selCircleGRP = new Anim();
        const pre = res === AssetTextureResolution.HD2? "HD2/": "";
         
        const readAnim = async () => await readCascFile(`${pre}anim/main_${i}.anim`);
        await selCircleGRP.load({
            readAnim,
            imageDef: { index: i },
        });

        selectionCirclesHD.push(selCircleGRP);
    }
    updateLoadingProcess("assets");
    return selectionCirclesHD;
}