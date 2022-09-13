import { MinimapGraphics } from "@render/minimap-graphics";
import Chk from "bw-chk";
import { unitTypes } from "common/enums";
import { Assets } from "common/types";
import { SceneComposer } from "./scene-composer";
import { SurfaceComposer } from "./surface-composer";
import { FogOfWar } from "../fogofwar";

export const createMinimapGraphicsComposer = (map: Chk, { scene, terrainExtra, getPlayerColor, units }: SceneComposer, { minimapSurface, viewports }: SurfaceComposer, fogOfWar: FogOfWar, assets: Assets) => {

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
            minimapGraphics.drawMinimap(minimapSurface, scene.mapWidth, scene.mapHeight, terrainExtra.creep.minimapImageData, !fogOfWar.enabled ? 0 : fogOfWar.effect.opacity, viewports);
        }
    }
}