import { promises as fsPromises } from "fs";
import path from "path";
import {
    // @ts-ignore
    SMAAImageLoader,
} from "postprocessing";

import fileExists from "common/utils/file-exists";
import { loadDATFiles } from "common/bwdat/load-dat-files";
import { AssetTextureResolution, GRPInterface, Settings } from "common/types";
import electronFileLoader from "common/utils/electron-file-loader";

import {
    openCascStorage,
    readCascFile,
} from "common/utils/casclib";

import { loadAnimAtlas, loadGlbAtlas, parseAnim } from "../image";


import gameStore from "../stores/game-store";
import processStore, { Process } from "../stores/process-store";
import loadSelectionCircles from "./load-selection-circles";
import generateIcons from "./generate-icons";
import Assets from "./assets";
import * as log from "../ipc/log"
import { openBwFiles, openBw } from "../openbw";
import { UnitTileScale } from "../core";
import loadEnvironmentMap from "../image/env-map";

export default async (settings: Settings) => {



    electronFileLoader((file: string) => {
        if (file.includes(".glb") || file.includes(".hdr") || file.includes(".png")) {
            return fsPromises.readFile(file);
        } else {
            return readCascFile(file);
        }
    });

    await openCascStorage(settings.directories.starcraft);

    log.verbose("@load-assets/openbw: ready buffers");
    await openBwFiles.loadBuffers(readCascFile);
    openBw.call!.main!();

    log.verbose("@load-assets/dat");
    const bwDat = await loadDATFiles(readCascFile);

    log.verbose("@load-assets/sd");
    const sdAnimBuf = await readCascFile("SD/mainSD.anim");
    const sdAnim = parseAnim(sdAnimBuf);

    log.verbose("@load-assets/selection-circles");
    const selectionCirclesHD = await loadSelectionCircles(settings.assets.images);

    const envMap = await loadEnvironmentMap(`${__static}/envmap.hdr`);

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
            settings.directories.assets,
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
                bwDat.grps[imageDat.grp],
                envMap
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
    log.info(`@load-assets/atlas: ${settings.assets.images}`);

    processStore().start(Process.AtlasPreload, 11);

    const loadImageAtlasGrp = loadImageAtlas(grps);
    for (let i = 0; i < 999; i++) {
        i % 100 === 0 && processStore().increment(Process.AtlasPreload);
        await loadImageAtlasGrp(i);
    }

    const smaaImages = (await new Promise(resolve => new SMAAImageLoader().load(resolve))) as any[]

    gameStore().setAssets(new Assets({
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
        loadImageAtlas: loadImageAtlasGrp,
        smaaImages,
        envMap
    }));
    processStore().complete(Process.AtlasPreload);
};