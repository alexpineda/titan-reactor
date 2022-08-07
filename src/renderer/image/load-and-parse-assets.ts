import { promises as fsPromises } from "fs";
import path from "path";
import fileExists from "common/utils/file-exists";
import { loadDATFiles } from "common/bwdat/load-dat-files";
import { AssetTextureResolution, Atlas, GlbAtlas, Settings, UnitTileScale } from "common/types";
import electronFileLoader from "common/utils/electron-file-loader";

import {
    openCascStorage,
    readCascFile,
} from "common/utils/casclib";

import { loadAnimAtlas, loadGlbAtlas, parseAnim } from ".";

import gameStore from "@stores/game-store";
import processStore, { Process } from "@stores/process-store";
import loadSelectionCircles from "./load-selection-circles";
import generateIcons from "./generate-icons/generate-icons";
import * as log from "../ipc/log"
import loadEnvironmentMap from "./environment/env-map";
import { calculateImagesFromUnitsIscript } from "../iscript/images-from-iscript";
import range from "common/utils/range";
import { unitTypes } from "common/enums";
import { CubeTexture, CubeTextureLoader } from "three";

export default async (settings: Settings) => {

    processStore().start(Process.AtlasPreload, 999);

    electronFileLoader((file: string) => {
        if (file.includes(".glb") || file.includes(".hdr") || file.includes(".png")) {
            return fsPromises.readFile(file);
        } else {
            return readCascFile(file);
        }
    });

    await openCascStorage(settings.directories.starcraft);

    log.verbose("@load-assets/dat");
    const bwDat = await loadDATFiles(readCascFile);

    log.verbose("@load-assets/images");
    const sdAnimBuf = await readCascFile("SD/mainSD.anim");
    const sdAnim = parseAnim(sdAnimBuf);

    const selectionCirclesHD = await loadSelectionCircles(UnitTileScale.HD);

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

    const loadingHD2 = new Set();
    const loadingHD = new Set();

    const loadImageAtlas = (atlases: Atlas[]) => async (imageId: number, res: UnitTileScale) => {
        if (res === UnitTileScale.HD) {
            if (loadingHD.has(imageId)) {
                return;
            } else {
                loadingHD.add(imageId);
            }
        } else if (res === UnitTileScale.HD2) {
            if (loadingHD2.has(imageId)) {
                return;
            } else {
                loadingHD2.add(imageId);
            }
        }

        let atlas: Atlas | GlbAtlas;
        const glbFileName = path.join(
            settings.directories.assets,
            `00${refId(
                imageId
            )}`.slice(-3) + ".glb"
        )
        const fs = await fileExists(glbFileName);
        const loadAnimBuffer = () => readCascFile(genFileName(imageId, res === UnitTileScale.HD2 ? "HD2/" : ""));
        const scale = res === UnitTileScale.HD2 ? UnitTileScale.HD2 : UnitTileScale.HD;

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
                bwDat.grps[imageDat.grp],
            )

            // add mipmaps to HD
            if (atlases[imageId]?.unitTileScale === UnitTileScale.HD2 && atlas.unitTileScale === UnitTileScale.HD) {
                const hd2 = atlases[imageId];
                atlas.diffuse.mipmaps.push(hd2.diffuse.mipmaps[0]);

                if (hd2.teammask) {
                    atlas.teammask?.mipmaps.push(hd2.teammask.mipmaps[0]);
                }
            }
        };
        atlases[imageId] = atlas;
    }

    const grps: Atlas[] = [];
    log.info(`@load-assets/atlas: ${settings.assets.images}`);

    const loadImageAtlasGrp = loadImageAtlas(grps);

    const omit = [unitTypes.khaydarinCrystalFormation, unitTypes.protossTemple, unitTypes.xelNagaTemple];
    const preloadImageIds = calculateImagesFromUnitsIscript(bwDat, [...range(0, 172).filter(id => !omit.includes(id)), ...[unitTypes.vespeneGeyser, unitTypes.mineral1, unitTypes.mineral2, unitTypes.mineral3, unitTypes.darkSwarm], ...range(220, 228)])

    processStore().start(Process.AtlasPreload, preloadImageIds.length);
    for (const id of preloadImageIds) {
        processStore().increment(Process.AtlasPreload);
        await loadImageAtlasGrp(id, UnitTileScale.HD2);
    }

    // warp in flash
    await loadImageAtlasGrp(210, settings.assets.images === AssetTextureResolution.SD ? UnitTileScale.SD : UnitTileScale.HD);

    const loader = new CubeTextureLoader();
    const rootPath = path.join(__static, "skybox", "sparse");
    loader.setPath(rootPath);

    const skyBox = await new Promise(res => loader.load([
        "right.png",
        "left.png",
        "top.png",
        "bot.png",
        "front.png",
        "back.png",
    ], res)) as CubeTexture;

    gameStore().setAssets({
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
        envMap,
        loadAnim: loadImageAtlasGrp,
        skyBox
    });
    processStore().complete(Process.AtlasPreload);
};