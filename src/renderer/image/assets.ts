import { promises as fsPromises } from "fs";
import path from "path";
import fileExists from "common/utils/file-exists";
import { loadDATFiles } from "common/bwdat/load-dat-files";
import { AnimAtlas, Settings, UnitTileScale } from "common/types";
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
import { loadEnvironmentMap } from "./environment/env-map";
import { calculateImagesFromUnitsIscript } from "../utils/images-from-iscript";
import range from "common/utils/range";
import { imageTypes, unitTypes } from "common/enums";
import { CubeTexture, CubeTextureLoader } from "three";
import settingsStore from "@stores/settings-store";

const genFileName = (i: number, prefix = "") => `${prefix}anim/main_${`00${i}`.slice(-3)}.anim`;
const loadAnimBuffer = (refImageId: number, res: UnitTileScale) => readCascFile(genFileName(refImageId, res === UnitTileScale.HD2 ? "HD2/" : ""));

const setHDMipMaps = (hd: AnimAtlas, hd2: AnimAtlas) => {
    hd.diffuse.mipmaps.push(hd2.diffuse.mipmaps[0]);

    if (hd2.teammask) {
        hd.teammask?.mipmaps.push(hd2.teammask.mipmaps[0]);
    }
}

export default async (settings: Settings) => {

    processStore().start(Process.AtlasPreload, 999);

    electronFileLoader((file: string) => {
        if (file.includes(".glb") || file.includes(".hdr") || file.includes(".png") || file.includes(".exr")) {
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

    const envEXRAssetFilename = path.join(
        settings.directories.assets,
        "envmap.exr"
    )
    const envMapFilename = await fileExists(envEXRAssetFilename) ? envEXRAssetFilename : `${__static}/envmap.hdr`;
    const envMap = await loadEnvironmentMap(envMapFilename);

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

    // lurker egg -> egg,
    const customRefs: Record<number, number> = {
        914: 21
    }

    const refId = (id: number) => {
        if (sdAnim?.[id]?.refId !== undefined) {
            return sdAnim[id].refId!;
        }
        return customRefs[id] ?? id;
    };



    const loadingHD2 = new Set();
    const loadingHD = new Set();
    const glbExists = new Map<number, boolean>();
    const atlases: AnimAtlas[] = [];
    const glbFileName = (refImageId: number) => path.join(
        settings.directories.assets,
        `00${refImageId}`.slice(-3) + ".glb"
    )
    const loadImageAtlas = async (imageId: number, earlyGlb = false) => {
        const refImageId = refId(imageId);
        const imageDat = bwDat.images[imageId];

        let res = UnitTileScale.HD2;
        if (atlases[refImageId]?.isHD) {
            return;
        } else if (atlases[refImageId]?.isHD2) {
            if (loadingHD.has(refImageId)) {
                return;
            }
            res = UnitTileScale.HD;
            loadingHD.add(refImageId);
            loadingHD.add(imageId);
        } else if (loadingHD2.has(refImageId)) {
            return;
        } else if (!loadingHD2.has(refImageId)) {
            loadingHD2.add(refImageId);
            loadingHD2.add(imageId);
            glbExists.set(refImageId, await fileExists(glbFileName(refImageId)));
        }

        // load glb after hd2 but before hd
        if (glbExists.get(refImageId) && (atlases[refImageId]?.isHD2 || earlyGlb)) {
            glbExists.set(imageId, false);
            const glb = await loadGlbAtlas(
                glbFileName(refImageId),
                earlyGlb ? await loadAnimAtlas(await loadAnimBuffer(refImageId, res), imageDat, res, bwDat.grps[imageDat.grp]) : atlases[refImageId],
                imageDat,
                envMap,
            );
            atlases[imageId] = glb;
            atlases[refImageId] = glb
            if (earlyGlb) return;
        }

        const anim = await loadAnimAtlas(await loadAnimBuffer(refImageId, res), imageDat, res, bwDat.grps[imageDat.grp]);

        if (atlases[imageId]?.isHD2 && anim.isHD) {
            setHDMipMaps(anim, atlases[imageId]);
        }

        if (anim.isHD2 && atlases[imageId]?.isHD) {
            console.warn("hd2 after hd", imageId);
        }

        if (atlases[imageId] !== undefined) {
            // assigning to a new object since ImageHD needs to test against its existing atlas
            atlases[imageId] = Object.assign({}, atlases[imageId], anim);
            atlases[refImageId] = Object.assign({}, atlases[refImageId], anim)
        } else {
            atlases[imageId] = anim;
            atlases[refImageId] = anim
        }

    }

    if (settings.assets.preload) {
        log.info(`@load-assets/atlas: preload`);
        const omit = [unitTypes.khaydarinCrystalFormation, unitTypes.protossTemple, unitTypes.xelNagaTemple];
        const preloadImageIds = calculateImagesFromUnitsIscript(bwDat, [...range(0, 172).filter(id => !omit.includes(id)), ...[unitTypes.vespeneGeyser, unitTypes.mineral1, unitTypes.mineral2, unitTypes.mineral3, unitTypes.darkSwarm], ...range(220, 228)])

        processStore().start(Process.AtlasPreload, preloadImageIds.length);
        for (const id of preloadImageIds) {
            processStore().increment(Process.AtlasPreload);
            await loadImageAtlas(id);
        }
    }

    await loadImageAtlas(imageTypes.warpInFlash);

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
        grps: atlases,
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
        loadImageAtlas: (imageId: number) => {
            loadImageAtlas(imageId);
            return atlases[imageId];
        },
        loadImageAtlasAsync: (imageId: number, earlyGlb: boolean) => loadImageAtlas(imageId, earlyGlb),
        skyBox,
        refId,
        resetAssetCache: () => {
            atlases.length = 0;
            loadingHD.clear();
            loadingHD2.clear();
            glbExists.clear();
        }
    });
    processStore().complete(Process.AtlasPreload);
};

export const loadImageAtlasDirect = async (imageId: number, image3d: boolean) => {
    const assets = gameStore().assets!;
    const settings = settingsStore().data!;

    const refImageId = assets.refId(imageId);
    const glbFileName = path.join(
        settings.directories.assets,
        `00${refImageId}`.slice(-3) + ".glb"
    )
    const glbFileExists = image3d ? await fileExists(glbFileName) : false;

    const imageDat = assets.bwDat.images[imageId];
    if (glbFileExists) {
        log.verbose(`loading glb  ${glbFileName}`);
        const anim = await loadAnimAtlas(
            await loadAnimBuffer(refImageId, UnitTileScale.HD),
            imageDat,
            UnitTileScale.HD,
            assets.bwDat.grps[imageDat.grp],
        );
        return await loadGlbAtlas(
            glbFileName,
            anim,
            imageDat,
            assets.envMap
        );
    } else {
        return await loadAnimAtlas(
            await loadAnimBuffer(refImageId, UnitTileScale.HD),
            imageDat,
            UnitTileScale.HD,
            assets.bwDat.grps[imageDat.grp],
        )
    }
}