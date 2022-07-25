import { Surface } from "@image/canvas";
import { UserInputCallbacks } from "common/types";

let _generatingMinimapFog = false;
let _generatingUnits = false;
let _generatingResources = false;
let _generatingCreep = false;

let fogBitmap: ImageBitmap;
let unitsBitmap: ImageBitmap;
let resourcesBitmap: ImageBitmap;
let creepBitmap: ImageBitmap;

export const drawMinimap = ({ canvas, ctx }: Surface, mapWidth: number, mapHeight: number, minimapUnitsImage: ImageData, minimapResourcesImage: ImageData, minimapFOWImage: ImageData, creepImage: ImageData, terrainBitmap: ImageBitmap, fogOfWarEnabled: boolean, callbacks: UserInputCallbacks) => {

    if (!_generatingMinimapFog) {
        _generatingMinimapFog = true;

        createImageBitmap(minimapFOWImage).then((ib) => {
            fogBitmap = ib;
            _generatingMinimapFog = false;
        });
    }

    if (!_generatingUnits) {
        _generatingUnits = true;
        createImageBitmap(minimapUnitsImage).then((ib) => {
            unitsBitmap = ib;
            _generatingUnits = false;
        });
    }

    if (!_generatingResources) {
        _generatingResources = true;
        createImageBitmap(minimapResourcesImage).then((ib) => {
            resourcesBitmap = ib;
            _generatingResources = false;
        });
    }

    if (!_generatingCreep) {
        _generatingCreep = true;
        createImageBitmap(creepImage).then((ib) => {
            creepBitmap = ib;
            _generatingCreep = false;
        });
    }

    if (!fogBitmap || !unitsBitmap || !resourcesBitmap || !creepBitmap) return;

    ctx.save();

    ctx.drawImage(
        terrainBitmap,
        0,
        0,
        canvas.width,
        canvas.height
    );

    if (creepBitmap) {
        ctx.drawImage(
            creepBitmap,
            0,
            0,
            canvas.width,
            canvas.height
        );
    }

    if (unitsBitmap) {
        ctx.drawImage(
            unitsBitmap,
            0,
            0,
            canvas.width,
            canvas.height
        );
    }

    if (fogBitmap && fogOfWarEnabled) {
        ctx.drawImage(
            fogBitmap,
            0,
            0,
            canvas.width,
            canvas.height
        );
    }

    if (resourcesBitmap) {
        ctx.drawImage(
            resourcesBitmap,
            0,
            0,
            canvas.width,
            canvas.height
        );
    }

    ctx.setTransform(
        canvas.width / mapWidth,
        0,
        0,
        canvas.height / mapHeight,
        canvas.width / 2,
        canvas.height / 2
    );

    callbacks.onDrawMinimap(ctx);

    ctx.restore();


};