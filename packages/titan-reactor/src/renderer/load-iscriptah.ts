import gameStore from "./stores/game-store";
import processStore, { Process } from "./stores/process-store"
import screenStore from "./stores/screen-store"
import getFunString from "./bootup/get-fun-string";
import waitForAssets from "./bootup/wait-for-assets";
import { ScreenType } from "../common/types";
export default async () => {
    gameStore().disposeGame();

    processStore().init({
        id: Process.IScriptahInitialization,
        label: getFunString(),
        priority: 1,
    })

    screenStore().init(ScreenType.IScriptah)

    await waitForAssets();
    const assets = gameStore().assets;
    if (!assets || !assets.bwDat) {
        throw new Error("assets not loaded");
    }

    processStore().complete(Process.IScriptahInitialization);
    screenStore().complete();
};