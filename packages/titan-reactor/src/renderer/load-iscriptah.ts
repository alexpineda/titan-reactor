
import {
    disposeGame,
    getAssets,
} from "./stores";
import processStore, { Process } from "./stores/process-store"
import screenStore, { ScreenType } from "./stores/screen-store"
// import IScriptah from "./react-ui/iscriptah/iscriptah";
import getFunString from "./bootup/get-fun-string";
import waitForAssets from "./bootup/wait-for-assets";

export default async () => {
    disposeGame();

    processStore().init({
        id: Process.IScriptahInitialization,
        label: getFunString(),
        priority: 1,
    })

    screenStore().init(ScreenType.IScriptah)

    await waitForAssets();
    const assets = getAssets();
    if (!assets || !assets.bwDat) {
        throw new Error("assets not loaded");
    }

    // const game = await IScriptah();
    // setGame(game);
    processStore().complete(Process.IScriptahInitialization);
    screenStore().complete();
};