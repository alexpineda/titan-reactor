import { CursorMaterial } from "@image/effects/cursor-material";
import { MinimapMaterial } from "@render/minimap-material";
import { unitTypes } from "common/enums";
import { Assets } from "common/types";
import { Mesh, PlaneBufferGeometry, Scene } from "three";
import { InputComposer } from "./input-composer";
import { SceneComposer } from "./scene-composer";
import { SurfaceComposer } from "./surface-composer";
import { World } from "./world";
import fragmentShader from "../../render/minimap-frag.glsl";
import vertexShader from "../../render/minimap-vert.glsl";

export type OverlayComposer = ReturnType<typeof createOverlayComposer>;

export const createOverlayComposer = ({ map, fogOfWar, events }: World, { terrainExtra, getPlayerColor, units }: SceneComposer, { gameSurface }: SurfaceComposer, inputs: InputComposer, assets: Assets) => {

    const overlayGroup = new Scene();

    const cursorMaterial = new CursorMaterial(assets);
    const cursorGraphics = new Mesh(new PlaneBufferGeometry(1, 1), cursorMaterial);
    cursorGraphics.frustumCulled = false;
    cursorGraphics.matrixAutoUpdate = false;

    if (module.hot) {

        module.hot.accept("../../render/minimap-frag.glsl", () => {

            minimapMaterial.fragmentShader = fragmentShader;
            minimapMaterial.needsUpdate = true;

        });

        module.hot.accept("../../render/minimap-vert.glsl", () => {

            minimapMaterial.vertexShader = vertexShader;
            minimapMaterial.needsUpdate = true;

        });

        module.hot.accept("@render/minimap-material", () => {

            minimapMaterial = new MinimapMaterial(map.size[0], map.size[1], terrainExtra.dataTextures.sdMap);
            minimapGraphics.material = minimapMaterial;
            minimapMaterial.uniforms.uResolution.value.set(gameSurface.bufferWidth, gameSurface.bufferHeight);
            minimapMaterial.uniformsNeedUpdate = true;

        });

    }

    let minimapMaterial = new MinimapMaterial(map.size[0], map.size[1], terrainExtra.dataTextures.sdMap);
    const minimapGraphics = new Mesh(new PlaneBufferGeometry(1, 1), minimapMaterial);
    minimapGraphics.frustumCulled = false;
    minimapGraphics.matrixAutoUpdate = false;

    overlayGroup.add(minimapGraphics, cursorGraphics);

    const ignoreOnMinimap = [unitTypes.darkSwarm, unitTypes.disruptionWeb];

    cursorMaterial.uniforms.uResolution.value.set(gameSurface.bufferWidth, gameSurface.bufferHeight);
    minimapMaterial.uniforms.uResolution.value.set(gameSurface.bufferWidth, gameSurface.bufferHeight);

    events.on("resize", (surface) => {

        console.log("overlay:resize", surface)
        cursorMaterial.uniforms.uResolution.value.set(surface.bufferWidth, surface.bufferHeight);
        minimapMaterial.uniforms.uResolution.value.set(surface.bufferWidth, surface.bufferHeight);
        minimapMaterial.uniformsNeedUpdate = true;
        cursorMaterial.uniformsNeedUpdate = true;


    })

    events.on("settings-changed", ({ settings }) => {

        minimapMaterial.scale.set(settings.game.minimapSize, settings.game.minimapSize, 1);
        minimapMaterial.updateMatrix();

        minimapMaterial.uniformsNeedUpdate = true;
        minimapMaterial.visible = settings.game.minimapEnabled;

    });


    return {
        overlayGroup,
        update(delta: number) {

            cursorMaterial.update(delta, inputs.mousePosition, inputs.unitSelectionStatus);

        },

        onFrame() {

            minimapMaterial.update(fogOfWar.buffer, terrainExtra.creep.minimapImageData, fogOfWar.effect.opacity);

            for (const unit of units) {
                if (!ignoreOnMinimap.includes(unit.typeId)) {
                    minimapMaterial.buildUnitMinimap(unit, assets.bwDat.units[unit.typeId], fogOfWar, getPlayerColor)
                }
            }

            //     for (const viewport of views.activeViewports()) {

            //         const view = viewport.projectedView;
            //         ctx.strokeStyle = "white";
            //         ctx.lineWidth = 0.8;
            //         ctx.beginPath();
            //         ctx.moveTo(...view.tl);
            //         ctx.lineTo(...view.tr);
            //         ctx.lineTo(...view.br);
            //         ctx.lineTo(...view.bl);
            //         ctx.lineTo(...view.tl);
            //         ctx.stroke();

            //     }

        }
    }
}