import * as THREE from "three";
import { blendNonZeroPixels } from "../rgb";
import { MapBitmapsResult } from "./generate-map-data-bitmaps";

export interface DataTexturesResult {
    sdMap: THREE.DataTexture,
    roughnessMap: THREE.DataTexture,
    mapTilesMap: THREE.DataTexture,
    creepTextureUniform: {
        value: THREE.DataTexture,
    },
    creepEdgesTextureUniform: {
        value: THREE.DataTexture,
    },
    displacementDetailsMap: THREE.DataTexture,
    elevationsMap: THREE.DataTexture,
    nonZeroElevationsMap: THREE.DataTexture,
    paletteIndicesMap: THREE.DataTexture,
    paletteMap: THREE.DataTexture,
}
export const generateMapDataTextures = async ({
    blendNonWalkableBase,
    palette,
    mapWidth,
    mapHeight,
    mapData,

}:
    {
        blendNonWalkableBase: boolean,
        palette: Uint8Array,
        mapWidth: number,
        mapHeight: number,
        mapData: MapBitmapsResult,
    }
): Promise<DataTexturesResult> => {

    //#region texture definitions
    const sdMap = new THREE.DataTexture(
        mapData.diffuse,
        mapWidth * 32,
        mapHeight * 32,
        THREE.RGBAFormat,
        THREE.UnsignedByteType
    );
    sdMap.flipY = true;
    sdMap.encoding = THREE.sRGBEncoding;
    sdMap.needsUpdate = true;


    const roughnessMap = new THREE.DataTexture(
        mapData.roughness,
        mapWidth * 32,
        mapHeight * 32,
        THREE.RedIntegerFormat,
        THREE.UnsignedByteType
    );
    roughnessMap.flipY = true;
    roughnessMap.needsUpdate = true;


    const mapTilesMap = new THREE.DataTexture(
        mapData.mapTilesData,
        mapWidth,
        mapHeight,
        THREE.RedIntegerFormat,
        THREE.UnsignedShortType
    );
    mapTilesMap.internalFormat = "R16UI";
    mapTilesMap.flipY = true;
    mapTilesMap.needsUpdate = true;


    const creepEdgesBytes = new Uint8Array(mapWidth * mapHeight);
    const creepEdgesValues = new THREE.DataTexture(
        creepEdgesBytes,
        mapWidth,
        mapHeight,
        THREE.RedFormat,
        THREE.UnsignedByteType
    );
    creepEdgesValues.flipY = true;
    creepEdgesValues.needsUpdate = true;


    const creepBytes = new Uint8Array(mapWidth * mapHeight);
    const creepValues = new THREE.DataTexture(
        creepBytes,
        mapWidth,
        mapHeight,
        THREE.RedFormat,
        THREE.UnsignedByteType
    );
    creepValues.flipY = true;
    creepValues.needsUpdate = true;

    const displacementDetailsMap = new THREE.DataTexture(
        mapData.displacementDetail,
        mapWidth * 32,
        mapHeight * 32,
        THREE.RedIntegerFormat,
        THREE.UnsignedByteType
    );
    displacementDetailsMap.internalFormat = "R8UI";
    displacementDetailsMap.flipY = true;
    displacementDetailsMap.needsUpdate = true;

    // Elevations in terms of the game low mid high etc
    const elevationsMap = new THREE.DataTexture(
        mapData.layers,
        mapWidth * 4,
        mapHeight * 4,
        THREE.RedIntegerFormat,
        THREE.UnsignedByteType
    );
    elevationsMap.internalFormat = "R8UI";
    elevationsMap.flipY = true;
    elevationsMap.needsUpdate = true;


    const nonZeroLayers = mapData.layers.slice(0);

    for (let x = 0; x < mapWidth * 4; x++) {
        for (let y = 0; y < mapHeight * 4; y++) {
            const pos = y * mapWidth * 4 + x;
            if ([0, 2, 4].includes(nonZeroLayers[pos])) {
                nonZeroLayers[pos] = 0;
            }
        }
    }

    if (blendNonWalkableBase) {
        blendNonZeroPixels(nonZeroLayers, mapWidth * 4, mapHeight * 4);
    }

    const nonZeroElevationsMap = new THREE.DataTexture(
        nonZeroLayers,
        mapWidth * 4,
        mapHeight * 4,
        THREE.RedIntegerFormat,
        THREE.UnsignedByteType
    );
    nonZeroElevationsMap.internalFormat = "R8UI";
    nonZeroElevationsMap.flipY = true;
    nonZeroElevationsMap.needsUpdate = true;

    // sd palette rotation
    const paletteIndicesMap = new THREE.DataTexture(
        mapData.paletteIndices,
        mapWidth * 32,
        mapHeight * 32,
        THREE.RedIntegerFormat,
        THREE.UnsignedByteType
    );
    paletteIndicesMap.internalFormat = "R8UI";
    paletteIndicesMap.flipY = true;
    paletteIndicesMap.needsUpdate = true;

    const floatPalette = new Float32Array(palette.length);
    for (let i = 0; i < palette.length; i++) {
        floatPalette[i] = palette[i] / 255;
    }
    const paletteMap = new THREE.DataTexture(
        floatPalette,
        palette.length / 4,
        1,
        THREE.RGBAFormat,
        THREE.FloatType
    );
    paletteMap.encoding = THREE.sRGBEncoding;

    return {
        sdMap,
        roughnessMap,
        mapTilesMap,
        creepTextureUniform: { value: creepValues },
        creepEdgesTextureUniform: { value: creepEdgesValues },
        displacementDetailsMap,
        elevationsMap,
        nonZeroElevationsMap,
        paletteIndicesMap,
        paletteMap,
    };
};
export default generateMapDataTextures;
