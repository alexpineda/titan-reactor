import { promises as fsPromises } from "fs";
import path, { resolve } from "path";
import fileExists from "../../common/utils/file-exists";
import { loadDATFiles } from "../../common/bwdat/core/load-dat-files";
import { loadAnimAtlas, loadGlbAtlas, parseAnim } from "../../common/image";
import {
    openCascStorage,
    readCascFile,
} from "../../common/utils/casclib";

import {
    // @ts-ignore
    SMAAImageLoader,
}
    from "postprocessing";

import {
    startLoadingProcess,
    updateLoadingProcess,
    completeLoadingProcess,
    setAssets,
} from "../stores";
import electronFileLoader from "../../common/utils/electron-file-loader";
import loadSelectionCircles from "./load-selection-circles";
import generateIcons from "./generate-icons";
import Assets from "./assets";
import * as log from "../ipc/log"
import { AssetTextureResolution, GRPInterface, Settings } from "../../common/types";
import { openBwFiles, openBw } from "../openbw";
import { UnitTileScale } from "../core";

export default async (settings: Settings) => {

    startLoadingProcess({
        id: "assets",
        label: "Loading initial assets",
        max: 101,
        priority: 10,
        current: 0,
        mode: "determinate",
    });

    electronFileLoader((file: string) => {
        if (file.includes(".glb") || file.includes(".hdr")) {
            return fsPromises.readFile(file);
        } else {
            return readCascFile(file);
        }
    });

    await openCascStorage(settings.directories.starcraft);

    log.verbose("Loading assets into openbw");
    await openBwFiles.loadBuffers(readCascFile);
    openBw.call.main();

    log.verbose("Loading dat files");
    const bwDat = await loadDATFiles(readCascFile);
    updateLoadingProcess("assets");

    log.verbose("Loading sd texture");
    const sdAnimBuf = await readCascFile("SD/mainSD.anim");
    const sdAnim = parseAnim(sdAnimBuf);
    const selectionCirclesHD = await loadSelectionCircles(settings.assets.images);

    // log("loading env map");
    // const renderer = new WebGLRenderer();
    // // this.envMap = await loadEnvironmentMap(renderer, `${__static}/envmap.hdr`);
    // renderer.dispose();

    const {
        resourceIcons,
        cmdIcons,
        raceInsetIcons,
        workerIcons,
        arrowIcons,
        hoverIcons,
        dragIcons,
        wireframeIcons,
    } = await generateIcons(readCascFile);

    const refId = (id: number) => {
        if (sdAnim[id] && sdAnim[id].refId) {
            return sdAnim[id].refId;
        }
        return id;
    };

    const genFileName = (i: number, prefix = "") => `${prefix}anim/main_${`00${refId(i)}`.slice(-3)}.anim`;

    const loadImageAtlas = (atlases: GRPInterface[]) => async (imageId: number) => {
        let atlas: GRPInterface;
        const glbFileName = path.join(
            settings.directories.models,
            `00${refId(
                imageId
            )}`.slice(-3) + ".glb"
        )
        const fs = await fileExists(glbFileName);
        const loadAnimBuffer = () => readCascFile(genFileName(imageId, settings.assets.images === AssetTextureResolution.HD2 ? "HD2/" : ""));
        const scale = settings.assets.images === AssetTextureResolution.HD2 ? UnitTileScale.HD2 : UnitTileScale.HD;

        const imageDat = bwDat.images[imageId];
        if (fs) {
            atlas = await loadGlbAtlas(
                glbFileName,
                loadAnimBuffer,
                imageDat,
                scale,
                bwDat.grps[imageDat.grp]
            );
        } else {
            atlas = await loadAnimAtlas(
                loadAnimBuffer,
                imageDat,
                scale,
                bwDat.grps[imageDat.grp]
            )
        }
        atlases[imageId] = atlas;
    };

    const grps: GRPInterface[] = [];
    log.info(`Generating image ${settings.assets.images} textures`);

    const loadImageAtlasGrp = loadImageAtlas(grps);
    for (let i = 0; i < 999; i++) {
        i % 100 === 0 && updateLoadingProcess("assets");
        await loadImageAtlasGrp(i);
    }

    const smaaImages = (await new Promise(resolve => new SMAAImageLoader().load(resolve))) as any[]

    setAssets(new Assets({
        bwDat,
        grps,
        selectionCirclesHD,
        gameIcons: resourceIcons,
        cmdIcons,
        raceInsetIcons,
        workerIcons,
        arrowIcons,
        hoverIcons,
        dragIcons,
        wireframeIcons,
        // for dynamic loading, if we wish
        loadImageAtlas: loadImageAtlasGrp,
        smaaImages
    }));
    completeLoadingProcess("assets");
};