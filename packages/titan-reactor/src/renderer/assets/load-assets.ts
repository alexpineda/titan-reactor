import { promises as fsPromises } from "fs";

import { loadDATFiles } from "../../common/bwdat/core/load-dat-files";
import { AtlasLoader, parseAnim } from "../../common/image";
import {
    openCascStorage,
    readCascFile,
} from "../../common/utils/casclib";
import ContiguousContainer from "../integration/fixed-data/contiguous-container";
import {
    startLoadingProcess,
    updateLoadingProcess,
    completeLoadingProcess,
} from "../stores";
import electronFileLoader from "../utils/electron-file-loader";
import loadSelectionCircles from "./load-selection-circles";
import generateIcons from "./generate-icons";
import Assets from "./assets";

export default async (starcraftPath: string, communityModelsPath: string) => {
    performance.mark("start-load-assets");
    startLoadingProcess({
        id: "assets",
        label: "Loading initial assets",
        max: 1010,
        priority: 10,
        current: 0,
        mode: "determinate",
    });

    electronFileLoader((file: string) => {
        if (file.includes(".glb") || file.includes(".hdr")) {
            //todo change to invoke
            return fsPromises.readFile(file);
        } else {
            return readCascFile(file);
        }
    });

    openCascStorage(starcraftPath);

    //@todo move parsing to client
    const bwDat = await loadDATFiles(readCascFile);
    updateLoadingProcess("assets");

    const sdAnimBuf = await readCascFile("SD/mainSD.anim");
    const sdAnim = parseAnim(sdAnimBuf);

    const selectionCirclesHD = await loadSelectionCircles();

    //@todo move to assets
    ContiguousContainer.prototype.bwDat = bwDat;

    // log("loading env map");
    // const renderer = new WebGLRenderer();
    // // this.envMap = await loadEnvironmentMap(renderer, `${__static}/envmap.hdr`);
    // renderer.dispose();

    const {
        gameIcons,
        cmdIcons,
        raceInsetIcons,
        workerIcons,
        arrowIcons,
        hoverIcons,
        dragIcons,
        wireframeIcons,
    } = await generateIcons(readCascFile);

    const atlasLoader = new AtlasLoader(
        bwDat,
        communityModelsPath,
        readCascFile,
        sdAnim
    );

    const grps = [];
    for (let i = 0; i < 999; i++) {
        grps[i] = await atlasLoader.load(i);
    }

    const perf = performance.measure("start-load-assets");
    console.log(`load assets took ${perf.duration}ms`);

    completeLoadingProcess("assets");

    return new Assets({
        bwDat,
        grps,
        selectionCirclesHD,
        gameIcons,
        cmdIcons,
        raceInsetIcons,
        workerIcons,
        arrowIcons,
        hoverIcons,
        dragIcons,
        wireframeIcons,
    });
};