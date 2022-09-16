import { CursorMaterial } from "@image/effects/cursor-material";
import { MinimapMaterial } from "@render/minimap-material";
import { unitTypes } from "common/enums";
import { Assets } from "@image/assets";
import { Intersection, Mesh, Object3D, PlaneBufferGeometry, Raycaster, Scene, Vector2 } from "three";
import { InputComposer } from "./input-composer";
import { SceneComposer } from "./scene-composer";
import { SurfaceComposer } from "./surface-composer";
import { World, WorldEvents } from "./world";
import fragmentShader from "../../render/minimap-frag.glsl";
import vertexShader from "../../render/minimap-vert.glsl";
import { ViewComposer } from "./view-composer";
import gameStore from "@stores/game-store";
import settingsStore from "@stores/settings-store";
import { createSelectionDisplayComposer } from "@core/selection-objects";
import { createUnitSelectionBox } from "@input/create-unit-selection";
import { ImageHD } from "@core/image-hd";
import { Image3D } from "@core/image-3d";
import { canSelectUnit } from "@utils/unit-utils";
import { Unit } from "@core/unit";

export type OverlayComposer = ReturnType<typeof createOverlayComposer>;

let _intersects: Intersection[] = [];

const _getSelectionUnit = (images: SceneComposer["images"]) => (object: Object3D): Unit | null => {

    if (object instanceof ImageHD || object instanceof Image3D) {
        return canSelectUnit(images.getUnit(object));
    } else if (object.parent) {
        return _getSelectionUnit(images)(object.parent);
    }

    return null;

};

export const createOverlayComposer = ({ map, fogOfWar, events, settings }: World, { terrainExtra, getPlayerColor, images, units, sprites, selectedUnits, scene }: SceneComposer, { gameSurface }: SurfaceComposer, inputs: InputComposer, viewComposer: ViewComposer, assets: Assets) => {

    const overlayGroup = new Scene();

    const unitSelectionBox = createUnitSelectionBox(inputs.mouse, selectedUnits, scene, _getSelectionUnit(images));
    const selectionDisplayComposer = createSelectionDisplayComposer(assets);
    scene.add(...selectionDisplayComposer.objects);

    const cursorMaterial = new CursorMaterial(assets);
    const cursorGraphics = new Mesh(new PlaneBufferGeometry(1, 1), cursorMaterial);

    cursorGraphics.frustumCulled = false;
    cursorGraphics.matrixAutoUpdate = false;
    cursorGraphics.renderOrder = 1000;

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
            minimap.material = minimapMaterial;
            applySettings({ settings: settings.getState(), rhs: {} });

        });

    }

    let minimapMaterial = new MinimapMaterial(map.size[0], map.size[1], terrainExtra.dataTextures.sdMap);
    minimapMaterial.mode = settings.getState().minimap.mode;

    const minimap = new Mesh(new PlaneBufferGeometry(1, 1), minimapMaterial);
    minimap.frustumCulled = false;
    minimap.renderOrder = 1;
    minimap.matrixAutoUpdate = false;

    const rayCast = new Raycaster();

    // const minimapConsoleMaterial = new BasicOverlayMaterial(assets.minimapConsole.square);
    // const minimapConsole = new Mesh(new PlaneBufferGeometry(1, 1), minimapConsoleMaterial);
    // minimapConsole.material.depthTest = false;
    // minimapConsole.material.depthWrite = false;
    // minimapConsole.material.transparent = true;
    // minimapConsole.visible = false;

    // minimapConsole.frustumCulled = false;
    // minimapConsole.renderOrder = 0;
    // minimapConsole.matrixAutoUpdate = false;

    // const minimapClockConsole = new Mesh(new PlaneBufferGeometry(1, 1), new MeshBasicMaterial({ map: assets.minimapConsole.clock }));

    overlayGroup.add(minimap, cursorGraphics);

    const ignoreOnMinimap = [unitTypes.darkSwarm, unitTypes.disruptionWeb];

    cursorMaterial.uniforms.uResolution.value.set(gameSurface.bufferWidth, gameSurface.bufferHeight);

    events.on("resize", (surface) => {

        console.log("overlay:resize", surface);

        applySettings({ settings: settings.getState(), rhs: {} });

        const rect = gameSurface.getMinimapDimensions(settings.getState().minimap.scale);

        // TODO: send transform matrix as well
        gameStore().setDimensions({
            minimapWidth: rect.minimapWidth,
            minimapHeight: settings.getState().minimap.enabled ? rect.minimapHeight : 0,
        });

    })

    function applySettings({ settings, rhs }: WorldEvents["settings-changed"]) {
        if (rhs.minimap?.mode) {
            minimapMaterial.mode = rhs.minimap.mode;
        }

        if (settings.minimap.mode === "3d") {
            minimapMaterial.rotation.set(settings.minimap.rotation[0], settings.minimap.rotation[1], settings.minimap.rotation[2]);
        } else {
            minimapMaterial.rotation.set(0, 0, 0);
        }

        minimapMaterial.scale.set(settings.minimap.scale, settings.minimap.scale, 1);
        minimapMaterial.position.set(settings.minimap.position[0], -settings.minimap.position[1], 0);

        minimapMaterial.uniforms.uOpacity.value = settings.minimap.opacity;
        minimapMaterial.uniforms.uSoftEdges.value = settings.minimap.softEdges ? 1 : 0;
        minimapMaterial.visible = settings.minimap.enabled;
        minimapMaterial.uniformsNeedUpdate = true;

        minimapMaterial.updateMatrix();
        // ignore the built in material camera for raycaster
        minimap.matrixWorld.copy(minimapMaterial.localMatrix);

        // minimapConsoleMaterial.uniforms.uOpacity.value = settings.minimap.opacity;
        // minimapConsoleMaterial.worldMatrix.copy(minimapMaterial.worldMatrix);
        // minimapConsoleMaterial.uniformsNeedUpdate = true;

        cursorMaterial.uniforms.uResolution.value.set(gameSurface.bufferWidth, gameSurface.bufferHeight);
        cursorMaterial.uniforms.uCursorSize.value = settingsStore().data.graphics.cursorSize;
        cursorMaterial.uniformsNeedUpdate = true;

    }

    events.on("settings-changed", ({ settings, rhs }) => {

        applySettings({ settings, rhs });

    });

    const mapV = new Vector2(map.size[0], map.size[1]);
    const mapAspectF = map.size[0] / map.size[1];
    const mapAspect = new Vector2(mapAspectF > 1.0 ? 1.0 / mapAspectF : 1.0, mapAspectF < 1.0 ? mapAspectF : 1.0);
    const bounds = new Vector2(0.5 - 0.5 * mapAspect.y, 0.5 - 0.5 * mapAspect.x);

    let _insideMinimap = false;

    //test events
    events.on("minimap-enter", () => {
        minimapMaterial.uniforms.uOpacity.value = Math.max(settings.getState().minimap.opacity + 0.5);
    });

    events.on("minimap-leave", () => {
        minimapMaterial.uniforms.uOpacity.value = settings.getState().minimap.opacity;
    });

    return {
        overlayGroup,
        unitSelectionBox,
        update(delta: number) {

            cursorMaterial.update(delta, inputs.mouse.move, unitSelectionBox.status);

            unitSelectionBox.enabled = _intersects.length === 0 ? settings.getState().input.unitSelection : false;
            unitSelectionBox.update();

            if (unitSelectionBox.isActive || !(settings.getState().minimap.interactive && settings.getState().minimap.enabled)) {
                if (_insideMinimap) {
                    events.emit("minimap-leave");
                    _insideMinimap = false;
                }
                return;
            }

            rayCast.setFromCamera(inputs.mouse.move, minimapMaterial.camera);

            _intersects.length = 0;
            minimap.matrixWorld.copy(minimapMaterial.localMatrix);
            minimap.raycast(rayCast, _intersects);

            if (_insideMinimap && _intersects.length === 0) {
                events.emit("minimap-leave");
            } else if (!_insideMinimap && _intersects.length > 0) {
                events.emit("minimap-enter");
            }

            unitSelectionBox.enabled = _insideMinimap = _intersects.length === 0;

            minimapMaterial.uniforms.uOpacity.value = settings.getState().minimap.opacity;

            if (_intersects.length && _intersects[0].uv) {

                minimapMaterial.uniforms.uOpacity.value = Math.min(1, settings.getState().minimap.opacity + 0.1);

                const uv = _intersects[0].uv;

                uv.set((uv.x - bounds.x) / mapAspect.y, (uv.y - bounds.y) / mapAspect.x);

                if (inputs.mouse.move.z > -1) {
                    viewComposer.onMinimapDragUpdate(uv.set(uv.x, 1 - uv.y).subScalar(0.5).multiply(mapV), !!inputs.mouse.clicked, inputs.mouse.move.z);
                }

            }

        },

        onFrame(completedUpgrades: number[][]) {

            selectionDisplayComposer.update(viewComposer.primaryCamera!, sprites, completedUpgrades, selectedUnits.toArray());

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