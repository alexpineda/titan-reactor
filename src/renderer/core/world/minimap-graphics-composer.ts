import { MinimapGraphics } from "@render/minimap-graphics";
import { unitTypes } from "common/enums";
import { Assets } from "common/types";
import { SceneComposer } from "./scene-composer";
import { SurfaceComposer } from "./surface-composer";
import { ViewComposer } from "./view-composer";
import { World } from "./world";

export const createMinimapGraphicsComposer = ({ map, fogOfWar }: World, { scene, terrainExtra, getPlayerColor, units }: SceneComposer, { minimapSurface }: SurfaceComposer, views: ViewComposer, assets: Assets) => {

    const minimapGraphics = new MinimapGraphics(map.size[0], map.size[1], terrainExtra.minimapBitmap);
    const ignoreOnMinimap = [unitTypes.darkSwarm, unitTypes.disruptionWeb];

    return {
        onFrame() {

            minimapGraphics.syncFOWBuffer(fogOfWar.buffer);
            minimapGraphics.resetUnitsAndResources();
            for (const unit of units) {
                if (!ignoreOnMinimap.includes(unit.typeId)) {
                    minimapGraphics.buildUnitMinimap(unit, assets.bwDat.units[unit.typeId], fogOfWar, getPlayerColor)
                }
            }
            minimapGraphics.drawMinimap(minimapSurface, scene.mapWidth, scene.mapHeight, terrainExtra.creep.minimapImageData, !fogOfWar.enabled ? 0 : fogOfWar.effect.opacity, (ctx) => {
                for (const viewport of views.activeViewports()) {

                    const view = viewport.projectedView;
                    ctx.strokeStyle = "white";
                    ctx.lineWidth = 0.8;
                    ctx.beginPath();
                    ctx.moveTo(...view.tl);
                    ctx.lineTo(...view.tr);
                    ctx.lineTo(...view.br);
                    ctx.lineTo(...view.bl);
                    ctx.lineTo(...view.tl);
                    ctx.stroke();

                }

            });
        }
    }
}