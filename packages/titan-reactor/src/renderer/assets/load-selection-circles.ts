import { Anim } from "../../common/image";
import {
    readCascFile,
} from "../../common/utils/casclib";
import {
    updateLoadingProcess,
} from "../stores";

export default async function () {
    const selectionCirclesHD = [];
    for (let i = 561; i < 571; i++) {
        const selCircleGRP = new Anim();
        const readAnim = async () => await readCascFile(`anim/main_${i}.anim`);
        const readAnimHD2 = async () =>
            await readCascFile(`HD2/anim/main_${i}.anim`);

        await selCircleGRP.load({
            readAnim,
            readAnimHD2,
            imageDef: { index: i },
        });

        selectionCirclesHD.push(selCircleGRP);
    }
    updateLoadingProcess("assets");
    return selectionCirclesHD;
}