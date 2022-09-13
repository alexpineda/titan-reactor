import {
    HalfFloatType,
    WebGLRenderer,
    Matrix3,
    PerspectiveCamera
} from "three";

import {
    EffectComposer,
    EffectPass,
    KawaseBlurPass,
    CopyPass,
    ClearPass,
    KernelSize,
    BlendFunction,
} from "postprocessing";
import { MapEffect } from "./map-effect";

import { MapDataTextures } from "../create-data-textures";
import { GeometryOptions } from "common/types";
import { rgbaToGreyScale } from "@image/canvas";

type Matrix3LevelArgs = [number, number, number, number, number, number, number];

export const doHeightMapEffect = async ({
    palette,
    tileset,
    mapWidth,
    mapHeight,
    dataTextures,
    geomOptions,
    levels,
    renderer
}: {
    dataTextures: MapDataTextures,
    geomOptions: GeometryOptions,
    levels: Matrix3
    palette: Uint8Array,
    tileset: number,
    mapWidth: number,
    mapHeight: number,
    renderer: WebGLRenderer,
}

) => {
    const camera = new PerspectiveCamera();
    const composer = new EffectComposer(renderer, {
        frameBufferType: HalfFloatType,
    });
    composer.autoRenderToScreen = true;

    composer.setSize(
        mapWidth * geomOptions.textureDetail,
        mapHeight * geomOptions.textureDetail,
        true
    );
    const savePass = new CopyPass();
    const blurPassHuge = new KawaseBlurPass({
        kernelSize: geomOptions.firstBlur
    });

    composer.removeAllPasses();
    composer.addPass(new ClearPass());

    const {
        sdMap,
        nonZeroElevationsMap,
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
    composer.addPass(new CopyPass());
    if (geomOptions.firstPass) {
        composer.render(0);
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

    const blurPassMed = new KawaseBlurPass({
        kernelSize: KernelSize.VERY_SMALL
    });
    composer.addPass(blurPassMed);
    if (geomOptions.secondPass) {
        composer.render(0.01);
    }

    const displaceCanvas = document.createElement("canvas");
    displaceCanvas.width = mapWidth * geomOptions.textureDetail;
    displaceCanvas.height = mapHeight * geomOptions.textureDetail;

    displaceCanvas.getContext("2d")?.drawImage(renderer.domElement, 0, 0);

    const displacementImage = displaceCanvas
        .getContext("2d")
        ?.getImageData(
            0,
            0,
            displaceCanvas.width,
            displaceCanvas.height
        )!;

    composer.dispose();

    return {
        displaceCanvas,
        displacementImage,
        singleChannel: rgbaToGreyScale(displacementImage.data, displacementImage.width, displacementImage.height)
    };
};
export type HeightMaps = Awaited<ReturnType<typeof doHeightMapEffect>>;