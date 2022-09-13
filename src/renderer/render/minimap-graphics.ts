import { FogOfWar } from "@core/fogofwar";
import { Unit } from "@core/unit";
import { Surface } from "@image/canvas";
import { unitTypes } from "common/enums";
import { UnitDAT, UserInputCallbacks } from "common/types";
import { floor32 } from "common/utils/conversions";
import { Color } from "three";

export class MinimapGraphics {
    #generatingMinimapFog = false;
    #generatingUnits = false;
    #generatingResources = false;
    #generatingCreep = false;

    #fogBitmap?: ImageBitmap;
    #unitsBitmap?: ImageBitmap;
    #resourcesBitmap?: ImageBitmap;
    #creepBitmap?: ImageBitmap;

    drawMinimap({ canvas, ctx }: Surface, mapWidth: number, mapHeight: number, creepImage: ImageData, fogOfWarOpacity: number, callbacks: UserInputCallbacks) {

        if (!this.#generatingMinimapFog) {
            this.#generatingMinimapFog = true;

            createImageBitmap(this.#minimapFOWImage).then((ib) => {
                this.#fogBitmap = ib;
                this.#generatingMinimapFog = false;
            });
        }

        if (!this.#generatingUnits) {
            this.#generatingUnits = true;
            createImageBitmap(this.#minimapUnitsImage).then((ib) => {
                this.#unitsBitmap = ib;
                this.#generatingUnits = false;
            });
        }

        if (!this.#generatingResources) {
            this.#generatingResources = true;
            createImageBitmap(this.#minimapResourcesImage).then((ib) => {
                this.#resourcesBitmap = ib;
                this.#generatingResources = false;
            });
        }

        if (!this.#generatingCreep) {
            this.#generatingCreep = true;
            createImageBitmap(creepImage).then((ib) => {
                this.#creepBitmap = ib;
                this.#generatingCreep = false;
            });
        }

        if (!this.#fogBitmap || !this.#unitsBitmap || !this.#resourcesBitmap || !this.#creepBitmap) return;

        ctx.save();

        ctx.drawImage(
            this.#minimapTerrainBitmap,
            0,
            0,
            canvas.width,
            canvas.height
        );

        if (this.#creepBitmap) {
            ctx.drawImage(
                this.#creepBitmap,
                0,
                0,
                canvas.width,
                canvas.height
            );
        }

        if (this.#unitsBitmap) {
            ctx.drawImage(
                this.#unitsBitmap,
                0,
                0,
                canvas.width,
                canvas.height
            );
        }

        if (this.#fogBitmap && fogOfWarOpacity) {
            ctx.save();
            ctx.globalAlpha = fogOfWarOpacity;
            ctx.drawImage(
                this.#fogBitmap,
                0,
                0,
                canvas.width,
                canvas.height
            );
            ctx.restore();
        }

        if (this.#resourcesBitmap) {
            ctx.drawImage(
                this.#resourcesBitmap,
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

    #minimapUnitsImage: ImageData;
    #minimapResourcesImage: ImageData;
    #minimapFOWImage: ImageData;
    #minimapTerrainBitmap: ImageBitmap;
    #resourceColor = new Color(0, 55, 55);
    #flashColor = new Color(200, 200, 200);
    #mapWidth: number;
    #mapHeight: number;

    constructor(mapWidth: number, mapHeight: number, minimapBitmap: ImageBitmap) {
        this.#minimapUnitsImage = new ImageData(mapWidth, mapHeight);
        this.#minimapResourcesImage = new ImageData(mapWidth, mapHeight);
        this.#minimapFOWImage = new ImageData(mapWidth, mapHeight);
        this.#minimapTerrainBitmap = minimapBitmap;

        this.#mapWidth = mapWidth;
        this.#mapHeight = mapHeight;
    }

    resetUnitsAndResources() {
        this.#minimapUnitsImage.data.fill(0);
        this.#minimapResourcesImage.data.fill(0);
    }

    buildUnitMinimap(unit: Unit, unitType: UnitDAT, fogOfWar: FogOfWar, getPlayerColor: (id: number) => Color) {
        const isResourceContainer = unitType.isResourceContainer && unit.owner === 11;
        if (
            (!isResourceContainer &&
                !fogOfWar.isVisible(floor32(unit.x), floor32(unit.y)))
        ) {
            return;
        }
        if (unitType.index === unitTypes.scannerSweep) {
            return;
        }

        let color;

        if (isResourceContainer) {
            color = this.#resourceColor;
        } else if (unit.owner < 8) {
            color = unit.extras.recievingDamage & 1 ? this.#flashColor : getPlayerColor(unit.owner);
        } else {
            return;
        }

        let w = Math.floor(unitType.placementWidth / 32);
        let h = Math.floor(unitType.placementHeight / 32);

        if (unitType.isBuilding) {
            if (w > 4) w = 4;
            if (h > 4) h = 4;
        }
        if (w < 2) w = 2;
        if (h < 2) h = 2;

        const unitX = Math.floor(unit.x / 32);
        const unitY = Math.floor(unit.y / 32);
        const wX = Math.floor(w / 2);
        const wY = Math.floor(w / 2);

        const _out = isResourceContainer ? this.#minimapResourcesImage : this.#minimapUnitsImage;
        const alpha = isResourceContainer ? 150 : 255;

        for (let x = -wX; x < wX; x++) {
            for (let y = -wY; y < wY; y++) {
                if (unitY + y < 0) continue;
                if (unitX + x < 0) continue;
                if (unitX + x >= this.#mapWidth) continue;
                if (unitY + y >= this.#mapHeight) continue;

                const pos = ((unitY + y) * this.#mapWidth + unitX + x) * 4;

                _out.data[pos] = Math.floor(color.r * 255);
                _out.data[pos + 1] = Math.floor(color.g * 255);
                _out.data[pos + 2] = Math.floor(color.b * 255);
                _out.data[pos + 3] = alpha;
            }
        }
    }

    syncFOWBuffer(buffer: Uint8Array) {
        for (let i = 0; i < this.#mapWidth * this.#mapHeight; i = i + 1) {
            this.#minimapFOWImage.data[i * 4 - 1] = Math.max(50, 255 - buffer[i]);
        }
    }

}