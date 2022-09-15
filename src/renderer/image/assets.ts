import { promises as fsPromises } from "fs";
import path from "path";
import fileExists from "common/utils/file-exists";
import { loadDATFiles } from "common/bwdat/load-dat-files";
import { AnimAtlas, Settings, UnitTileScale } from "common/types";
import electronFileLoader from "common/utils/electron-file-loader";

import {
    openCascStorage,
    readCascFile,
} from "@utils/casclib";

import { loadAnimAtlas, loadGlbAtlas, parseAnim } from ".";

import gameStore from "@stores/game-store";
import processStore, { Process } from "@stores/process-store";
import loadSelectionCircles from "./load-selection-circles";
import { generateAllIcons } from "./generate-icons/generate-icons";
import * as log from "../ipc/log"
import { loadEnvironmentMap } from "./environment/env-map";
import { calculateImagesFromUnitsIscript } from "../utils/images-from-iscript";
import range from "common/utils/range";
import { imageTypes, unitTypes } from "common/enums";
import { CubeTexture, CubeTextureLoader } from "three";
import settingsStore from "@stores/settings-store";
import { modelSetFileRefIds } from "@core/model-effects-configuration";

if (module.hot) {
    module.hot.accept("@core/model-effects-configuration")
}

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

    const refId = (id: number) => {
        if (sdAnim?.[id]?.refId !== undefined) {
            return sdAnim[id].refId!;
        }
        return id;
    };

    const loadingHD2 = new Set();
    const loadingHD = new Set();
    const glbExists = new Map<number, boolean>();
    const atlases: AnimAtlas[] = [];
    const glbFileName = (imageId: number) => path.join(
        settings.directories.assets,
        `00${imageId}`.slice(-3) + ".glb"
    )

    /**
     * Loads an image atlas for HD2, HD and GLTF.
     * It will load HD2/GLB at once then load HD once HD2.
     * If HD2 is ignored than only HD and GLB will be loaded.
     * if HD2 is forced than HD2 will be loaded and HD will be ignored.
     * refImageId means we use the same images and iscript with another image id.
     * glbRefImageId means we use the same glb/frame count with another image id.
     */
    const loadImageAtlas = async (imageId: number) => {

        const refImageId = refId(imageId);
        const glbRefImageId = modelSetFileRefIds.get(refImageId) ?? refImageId
        const imageDat = bwDat.images[imageId];
        const settings = settingsStore().data.graphics.useHD2 as "auto" | "ignore" | "force";

        let res = UnitTileScale.HD2;
        if (loadingHD.has(refImageId)) {

            return;

        } else if (atlases[refImageId]?.isHD2 || settings !== "auto") {

            if (loadingHD.has(refImageId)) {
                return;
            }
            res = settings === "force" ? UnitTileScale.HD2 : UnitTileScale.HD;
            loadingHD.add(refImageId);
            loadingHD.add(imageId);
            if (settings !== "auto") {
                glbExists.set(refImageId, await fileExists(glbFileName(glbRefImageId)));
            }

        } else if (loadingHD2.has(refImageId)) {

            return;

        } else if (!loadingHD2.has(refImageId)) {

            loadingHD2.add(refImageId);
            loadingHD2.add(imageId);
            glbExists.set(refImageId, await fileExists(glbFileName(glbRefImageId)));

        }

        const anim = await loadAnimAtlas(await loadAnimBuffer(refImageId, res), imageId, res);

        if (atlases[imageId]?.isHD2 && anim.isHD) {

            setHDMipMaps(anim, atlases[imageId]);

        }

        if (anim.isHD2 && atlases[imageId]?.isHD) {

            console.warn("hd2 after hd", imageId);

        }

        // assigning to a new object since ImageHD needs to test against its existing atlas
        atlases[imageId] = Object.assign({}, atlases[imageId], anim, { isHD: settings === "force" ? true : anim.isHD });
        atlases[refImageId] = Object.assign({}, atlases[refImageId], anim, { isHD: settings === "force" ? true : anim.isHD });

        if (glbExists.get(refImageId)) {

            glbExists.set(refImageId, false);

            const glb = await loadGlbAtlas(
                glbFileName(glbRefImageId),
                // use grp frames for convenience since we might fake being another image for re-use
                bwDat.grps[glbRefImageId].frames,
                imageDat,
                envMap,
            );

            atlases[imageId] = Object.assign({}, atlases[imageId], glb);
            atlases[refImageId] = Object.assign({}, atlases[refImageId], glb);

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
        atlases,
        selectionCircles: selectionCirclesHD,
        ...await generateAllIcons(readCascFile),
        envMap,
        loadImageAtlas: (imageId: number) => {
            loadImageAtlas(imageId);
            return atlases[imageId];
        },
        loadImageAtlasAsync: (imageId: number) => loadImageAtlas(imageId),
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
            imageId,
            UnitTileScale.HD,
        );

        return {
            ...anim, ...await loadGlbAtlas(
                glbFileName, anim.frames,
                imageDat,
                assets.envMap
            )
        };

    } else {

        return await loadAnimAtlas(
            await loadAnimBuffer(refImageId, UnitTileScale.HD),
            imageId,
            UnitTileScale.HD,
        )

    }
}