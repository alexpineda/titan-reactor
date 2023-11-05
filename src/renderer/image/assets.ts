import { BwDAT, UnitTileScale } from "common/types";

import {
    readCascFileRemote as readCascFile,
    closeCascStorageRemote as closeCascStorage,
    openCascStorageRemote as openCascStorage,
    readCascFileRemote,
} from "@ipc/casclib";

import {
    AnimAtlas,
    createDDSTexture,
    loadAnimAtlas,
    // loadGlbAtlas,
    parseAnim,
    RefAnim,
} from ".";

import gameStore, { setAsset } from "@stores/game-store";
import { generateCursorIcons  } from "./generate-icons/generate-icons";
import { log } from "@ipc/log";
import { imageTypes } from "common/enums";
// import { modelSetFileRefIds } from "@core/model-effects-configuration";
import { parseDDS } from "./formats/parse-dds";
import { b2ba } from "@utils/bin-utils";
import processStore from "@stores/process-store";
import { CubeTexture, CubeTextureLoader, Texture } from "three";
import { loadEnvironmentMap } from "./environment/env-map";
import { loadDATFiles } from "common/bwdat/load-dat-files";
import { ImageLoaderManager } from "./loader/image-loader";

/**
 * @public
 * Most game assets excepting sprites / images.
 */
export type Assets = Awaited<ReturnType<typeof initializeAssets>> & {
    envMap?: Texture;
    bwDat: BwDAT;
    wireframeIcons?: Blob[];
}

export const initializeAssets = async () => {
    const bwDat = await loadDATFiles(readCascFileRemote);
    setAsset("bwDat", bwDat);

    log.debug("@load-assets/images");
    const sdAnimBuf = await readCascFile("SD/mainSD.anim");
    const sdAnim = parseAnim(sdAnimBuf);

    processStore().increment();

    log.debug("@load-assets/selection-circles");
    const selectionCircles: AnimAtlas[] = [];
    for (let i = 561; i < 571; i++) {
        const selCircleGRP = loadAnimAtlas(
            await readCascFile(`anim/main_${i}.anim`),
            i,
            UnitTileScale.HD
        );

        selectionCircles.push(selCircleGRP);
    }

    const minimapConsole = {
        clock: createDDSTexture(
            parseDDS(
                b2ba(await readCascFile("game/observer/UIObserverSquareRight.DDS"))
            )
        ),
        square: createDDSTexture(
            parseDDS(b2ba(await readCascFile("game/observer/UIObserverSquareFull.DDS")))
        ),
    };

    const envMapFilename = __static + "/three/envmap.hdr";
    log.debug(`@load-assets/envmap: ${envMapFilename}`);
    loadEnvironmentMap(envMapFilename, (tex) => {
        setAsset("envMap", tex);
    })

    processStore().increment();

    const cursorIcons = await generateCursorIcons(readCascFile);

    const refId = (id: number) => {
        if (sdAnim[id].type === "ref") {
            return (sdAnim[id] as RefAnim).refId;
        }
        return id;
    };

    const imageLoaderManager = new ImageLoaderManager(refId);

    const loader = new CubeTextureLoader();
    const rootPath = __static + "/skybox/sparse/";
    loader.setPath(rootPath);

    const skyBox = await new Promise((res: (t: CubeTexture) => void) =>
        loader.load(
            ["right.png", "left.png", "top.png", "bot.png", "front.png", "back.png"],
            res
        )
    );

    processStore().increment();

    imageLoaderManager.loadImage(imageTypes.warpInFlash);

    const r = {
        openCascStorage,
        closeCascStorage,
        readCascFile,
        ...cursorIcons,
        selectionCircles,
        minimapConsole,
        loader: imageLoaderManager,
        loadImageAtlas(imageId: number) {
            imageLoaderManager.loadImage(imageId);
            return imageLoaderManager.getImage(imageId);
        },
        getImageAtlas(imageId: number): AnimAtlas | null {
            return imageLoaderManager.getImage(imageId);
        },
        hasImageAtlas(imageId: number): boolean {
            return !!imageLoaderManager.exists(imageId);
        },
        loadImageAtlasAsync(imageId: number) {
            return imageLoaderManager.loadImageImmediate(imageId);
        },
        skyBox,
        refId,
        resetImagesCache: () => {
            imageLoaderManager.dispose();
            // special case because this is an overlay? todo: figure this out please
            imageLoaderManager.loadImage(imageTypes.warpInFlash);
        },
    };

    gameStore().setAssets(r as Assets);

    return r;
};

export const loadImageAtlasDirect = async (imageId: number) => {
    //, image3d: boolean ) => {
    const assets = gameStore().assets!;
    // const settings = settingsStore().data;

    const imageLoaderManager = new ImageLoaderManager((x) => assets.refId(x));

    return imageLoaderManager.loadImageImmediate(imageId);
};
