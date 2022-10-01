import {
    HalfFloatType,
    WebGLRenderer,
    Matrix3,
    PerspectiveCamera,
    WebGLRenderTarget,
    LinearFilter
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

import { MapLookupTextures } from "../create-data-textures";
import { GeometryOptions } from "common/types";
import { rgbaToGreyScale } from "@image/canvas";

type Matrix3LevelArgs = [number, number, number, number, number, number, number];

export const doHeightMapEffect = async ({
    palette,
    tileset,
    mapWidth,
    mapHeight,
    lookupTextures,
    geomOptions,
    levels,
    renderer
}: {
    lookupTextures: MapLookupTextures,
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

    const [w, h] = [mapWidth * geomOptions.texPxPerTile, mapHeight * geomOptions.texPxPerTile];
    composer.setSize(
        w, h,
        false
    );
    const savePass = new CopyPass();
    const blurPassHuge = new KawaseBlurPass({
        kernelSize: geomOptions.firstBlur
    });

    composer.addPass(new ClearPass());

    composer.addPass(
        new EffectPass(
            camera,
            new MapEffect({
                texture: lookupTextures.mapDiffuseTex,
                elevations: lookupTextures.nonZeroElevationsTex,
                levels,
                ignoreLevels: new Matrix3(),
                mapTiles: lookupTextures.tilesTex,
                ignoreDoodads: 0,
                tileset,
                palette,
                paletteIndices: lookupTextures.paletteIndicesTex,
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

    for (const pass of composer.passes) {
        pass.dispose();
    }
    composer.removeAllPasses();

    const ignoreLevels = new Matrix3();
    ignoreLevels.set(...geomOptions.ignoreLevels as Matrix3LevelArgs, 0, 0);

    composer.addPass(
        new EffectPass(
            camera,
            new MapEffect({
                texture: lookupTextures.mapDiffuseTex,
                elevations: lookupTextures.elevationsTex,
                mapTiles: lookupTextures.tilesTex,
                ignoreDoodads: 1,
                levels,
                ignoreLevels,
                tileset,
                palette,
                processWater: geomOptions.processWater,
                paletteIndices: lookupTextures.paletteIndicesTex,
                blendFunction: BlendFunction.NORMAL,
            })
        )
    );

    const blurPassMed = new KawaseBlurPass({
        kernelSize: KernelSize.VERY_SMALL
    });
    composer.addPass(blurPassMed);
    const result = new WebGLRenderTarget(w, h, {
        stencilBuffer: false,
        depthBuffer: false,
        minFilter: LinearFilter,
        magFilter: LinearFilter,
    });
    composer.addPass(new CopyPass());
    // render to screen
    composer.addPass(new CopyPass());
    if (geomOptions.secondPass) {
        composer.render(0);
    }

    const buffer = new Uint16Array(w * h * 4);
    composer.getRenderer().readRenderTargetPixels(result, 0, 0, w, h, buffer);

    const out = new Uint8ClampedArray(w * h);
    for (let i = 0; i < buffer.length; i += 4) {
        out[i >> 2] = ((buffer[i] + buffer[i + 1] + buffer[i + 2]) / 3) / 257;
    }

    const displaceCanvas = document.createElement("canvas");
    displaceCanvas.width = mapWidth * geomOptions.texPxPerTile;
    displaceCanvas.height = mapHeight * geomOptions.texPxPerTile;

    displaceCanvas.getContext("2d")?.drawImage(renderer.domElement, 0, 0);

    const displacementImage = displaceCanvas
        .getContext("2d")!.getImageData(
            0,
            0,
            displaceCanvas.width,
            displaceCanvas.height
        )!;

    composer.dispose();

    return {
        texture: result.texture,
        // out,
        displaceCanvas,
        displacementImage,
        singleChannel: rgbaToGreyScale(displacementImage.data, displacementImage.width, displacementImage.height)
    };
};
export type HeightMaps = Awaited<ReturnType<typeof doHeightMapEffect>>;