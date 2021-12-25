import createDataTextures from "./create-data-textures";
import createDisplacementImages from "./create-displacement-images";
import { getTerrainY } from "./create-displacement-geometry";
import { minimapBitmap as genMinimapBitmap } from "./sd";

import {
    WebGLRenderer,
} from "three";

import { GenerateTexturesResult } from "./generate-map-tile-textures";
import { transformLevelConfiguration } from "./transform-level-configuration";
import createHDMaterials from "./create-hd-materials";
import createSDMaterials from "./create-sd-materials";
import { defaultOptions } from "./geometry-options";
import { TerrainInfo } from "../../types";

export const generateAllMapStuff = async (
    tileData: GenerateTexturesResult,
    geomOptions = defaultOptions
): Promise<TerrainInfo> => {
    const {
        mapWidth,
        mapHeight,
        mapData,
    } = tileData;

    const renderer = new WebGLRenderer({
        depth: false,
        stencil: false,
        alpha: true,
    });
    renderer.autoClear = false;

    const dataTextures = await createDataTextures(renderer.capabilities.getMaxAnisotropy(), tileData, geomOptions.blendNonWalkableBase);

    const levels = transformLevelConfiguration(geomOptions.elevationLevels, geomOptions.normalizeLevels);

    const displacementImages = await createDisplacementImages(renderer, tileData, dataTextures, geomOptions, levels);

    const hd = await createHDMaterials(tileData, geomOptions, dataTextures, displacementImages.displaceCanvas);
    const sd = await createSDMaterials(tileData, geomOptions, dataTextures, displacementImages.displaceCanvas);

    const minimapBitmap = await genMinimapBitmap(
        mapData.diffuse,
        mapWidth,
        mapHeight,
    );

    renderer.dispose();

    return {
        getTerrainY: getTerrainY(
            displacementImages.displacementImage,
            geomOptions.displacementScale,
            mapWidth,
            mapHeight
        ),
        mapWidth,
        mapHeight,
        minimapBitmap,
        ...hd,
        ...sd,
        creepEdgesTextureUniform: dataTextures.creepEdgesTextureUniform,
        creepTextureUniform: dataTextures.creepTextureUniform
    };
};
export default generateAllMapStuff;
