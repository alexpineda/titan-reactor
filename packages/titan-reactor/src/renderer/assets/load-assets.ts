import { promises as fsPromises } from "fs";
import path from "path";
import fileExists from "../../common/utils/file-exists";

import { loadDATFiles } from "../../common/bwdat/core/load-dat-files";
import { Glb, Anim, parseAnim } from "../../common/image";
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
import electronFileLoader from "../../common/utils/electron-file-loader";
import loadSelectionCircles from "./load-selection-circles";
import generateIcons from "./generate-icons";
import Assets from "./assets";
import * as log from "../ipc/log"

export default async (starcraftPath: string, communityModelsPath: string) => {
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
            //todo change to invoke
            return fsPromises.readFile(file);
        } else {
            return readCascFile(file);
        }
    });

    await openCascStorage(starcraftPath);

    const bwDat = await loadDATFiles(readCascFile);
    updateLoadingProcess("assets");

    const sdAnimBuf = await readCascFile("SD/mainSD.anim");
    const sdAnim = parseAnim(sdAnimBuf);

    const selectionCirclesHD = await loadSelectionCircles();

    ContiguousContainer.prototype.bwDat = bwDat;

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

    const loadImageAtlas = (grps: Anim[]) => async (imageId: number) => {
        const grp = new Glb();
        const glbFileName = path.join(
            communityModelsPath,
            `00${refId(
                imageId
            )}`.slice(-3) + ".glb"
        )

        const fs = await fileExists(glbFileName);
        fs && log.verbose(`${glbFileName} exists`);

        await grp.load({
            imageDef: bwDat.images[imageId],
            // readAnim: async () => readCascFile(genFileName(imageId)),
            readAnim: () => readCascFile(genFileName(imageId, "HD2/")),
            glbFileName: fs ? glbFileName : undefined,
        });
        if (grp.model) {
            log.verbose("successfully loaded glb");
        }
        grps[imageId] = grp;
    };

    const grps: Anim[] = [];
    const loadImageAtlasGrp = loadImageAtlas(grps);
    for (let i = 0; i < 999; i++) {
        i % 100 === 0 && updateLoadingProcess("assets");
        await loadImageAtlasGrp(i);
    }

    completeLoadingProcess("assets");

    return new Assets({
        bwDat,
        grps,
        selectionCirclesHD,
        resourceIcons,
        cmdIcons,
        raceInsetIcons,
        workerIcons,
        arrowIcons,
        hoverIcons,
        dragIcons,
        wireframeIcons,
        // for dynamic loading, if we wish
        loadImageAtlas: loadImageAtlasGrp
    });
};