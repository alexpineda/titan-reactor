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
import { GeometryOptions } from "./geometry-options";
import { AssetTextureResolution, TerrainInfo, Settings } from "../../types";

export const generateAllMapStuff = async (
    tileData: GenerateTexturesResult,
    geomOptions: GeometryOptions,
    settings: Settings
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

    const genTerrainMaterials = settings.terrainTextureResolution === AssetTextureResolution.SD ? createSDMaterials : createHDMaterials;

    const terrain = await genTerrainMaterials(tileData, geomOptions, dataTextures, displacementImages.displaceCanvas);

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
        terrain,
        creepEdgesTextureUniform: dataTextures.creepEdgesTextureUniform,
        creepTextureUniform: dataTextures.creepTextureUniform
    };
};
export default generateAllMapStuff;
