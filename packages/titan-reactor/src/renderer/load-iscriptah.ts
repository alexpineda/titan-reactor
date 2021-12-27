
import { log } from "./ipc";
import {
    disposeGame,
    getAssets,
    setGame,
    startLoadingProcess,
    completeLoadingProcess,
    initUIType,
    completeUIType,
    UITypeIscriptah,
} from "./stores";
// import IScriptah from "./react-ui/iscriptah/iscriptah";
import getFunString from "./bootup/get-fun-string";
import waitForAssets from "./bootup/wait-for-assets";

export default async () => {
    log("loading iscriptah");
    disposeGame();

    startLoadingProcess({
        id: "iscriptah",
        label: getFunString(),
        priority: 1,
    });

    initUIType({
        type: "iscriptah",
    } as UITypeIscriptah);

    await waitForAssets();
    const assets = getAssets();
    if (!assets || !assets.bwDat) {
        throw new Error("assets not loaded");
    }

    // const game = await IScriptah();
    // setGame(game);
    completeLoadingProcess("iscriptah");
    completeUIType();
};