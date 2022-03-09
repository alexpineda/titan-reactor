import {
    HalfFloatType,
    WebGLRenderer,
    Matrix3,
    PerspectiveCamera
} from "three";
import { strict as assert } from "assert";

import {
    EffectComposer,
    EffectPass,
    BlurPass,
    SavePass,
    ClearPass,
    KernelSize,
    BlendFunction,
    ConvolutionMaterial
} from "postprocessing";
import { MapEffect } from "./effects/map-effect";

import processStore, { Process } from "@stores/process-store";
import { DataTexturesResult } from "./generate-map-data-textures";
import { GeometryOptions } from "./geometry-options";

type Matrix3LevelArgs = [number, number, number, number, number, number, number];

// TODO: dispose effects?
export const createDisplacementImages = async ({
    palette,
    tileset,
    mapWidth,
    mapHeight,
    dataTextures,
    geomOptions,
    levels
}: {
    dataTextures: DataTexturesResult,
    geomOptions: GeometryOptions,
    levels: Matrix3
    palette: Uint8Array,
    tileset: number,
    mapWidth: number,
    mapHeight: number,
}

) => {
    const renderer = new WebGLRenderer({
        depth: false,
        stencil: false,
        alpha: true,
    });
    renderer.autoClear = false;
    const camera = new PerspectiveCamera();

    //#region composer
    const composer = new EffectComposer(renderer, {
        frameBufferType: HalfFloatType,
    });
    composer.autoRenderToScreen = true;

    composer.setSize(
        mapWidth * geomOptions.displaceDimensionScale,
        mapHeight * geomOptions.displaceDimensionScale,
        true
    );
    const savePass = new SavePass();
    const blurPassHuge = new BlurPass();
    blurPassHuge.convolutionMaterial = new ConvolutionMaterial();
    blurPassHuge.kernelSize = geomOptions.firstBlur;

    composer.removeAllPasses();
    composer.addPass(new ClearPass());

    const {
        sdMap,
        nonZeroElevationsMap,
        displacementDetailsMap,
        mapTilesMap,
        paletteIndicesMap,
        elevationsMap
    } = dataTextures;

    composer.addPass(
        new EffectPass(
            camera,
            new MapEffect({
                texture: sdMap,
                elevations: nonZeroElevationsMap,
                details: displacementDetailsMap,
                detailsMix: 0,
                levels,
                ignoreLevels: new Matrix3(),
                mapTiles: mapTilesMap,
                ignoreDoodads: 0,
                tileset,
                palette,
                paletteIndices: paletteIndicesMap,
                blendFunction: BlendFunction.NORMAL,
                processWater: false
            })
        )
    );
    composer.addPass(blurPassHuge);
    composer.addPass(savePass);
    composer.addPass(new SavePass());
    if (geomOptions.firstPass) {
        composer.render(0.01);
    }

    composer.removeAllPasses();

    const ignoreLevels = new Matrix3();
    ignoreLevels.set(...geomOptions.ignoreLevels as Matrix3LevelArgs, 0, 0);

    composer.addPass(
        new EffectPass(
            camera,
            new MapEffect({
                texture: sdMap,
                elevations: elevationsMap,
                details: displacementDetailsMap,
                detailsMix: geomOptions.detailsMix,
                mapTiles: mapTilesMap,
                ignoreDoodads: 1,
                levels,
                ignoreLevels,
                tileset,
                palette,
                processWater: geomOptions.processWater,
                paletteIndices: paletteIndicesMap,
                blendFunction: BlendFunction.NORMAL,
            })
        )
    );

    const blurPassMed = new BlurPass();
    blurPassMed.kernelSize = KernelSize.VERY_SMALL;
    composer.addPass(blurPassMed);
    if (geomOptions.secondPass) {
        composer.render(0.01);
    }
    //#endregion composer
    processStore().increment(Process.TerrainGeneration);
    renderer.dispose();

    const displaceCanvas = document.createElement("canvas");
    displaceCanvas.width = mapWidth * geomOptions.displaceDimensionScale;
    displaceCanvas.height = mapHeight * geomOptions.displaceDimensionScale;

    displaceCanvas.getContext("2d")?.drawImage(renderer.domElement, 0, 0);

    // small optimization: scale down for getTerrainY
    const displacementCanvasSmall = document.createElement("canvas");
    displacementCanvasSmall.width = mapWidth * 4;
    displacementCanvasSmall.height = mapHeight * 4;
    displacementCanvasSmall
        .getContext("2d")
        ?.drawImage(displaceCanvas, 0, 0, mapWidth * 4, mapHeight * 4);

    const displacementImage = displacementCanvasSmall
        .getContext("2d")
        ?.getImageData(
            0,
            0,
            displacementCanvasSmall.width,
            displacementCanvasSmall.height
        );
    assert(displacementImage)

    return {
        displaceCanvas,
        displacementImage,
        displacementCanvasSmall,
    };
};
export default createDisplacementImages;
