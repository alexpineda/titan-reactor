import { CursorMaterial } from "@image/effects/cursor-material";
import { BasicOverlayMaterial, MinimapMaterial } from "@render/minimap-material";
import { unitTypes } from "common/enums";
import { Assets } from "@image/assets";
import { Intersection, Matrix3, Matrix4, Mesh, Object3D, PlaneGeometry, Raycaster, Vector2 } from "three";
import { SceneComposer } from "./scene-composer";
import { World } from "./world";
import { WorldEvents } from "./world-events";
import { ViewInputComposer } from "./view-composer";
import gameStore from "@stores/game-store";
import { settingsStore } from "@stores/settings-store";
import { createSelectionDisplayComposer } from "@core/selection-objects";
import { createUnitSelectionBox, UnitSelectionStatus } from "@input/create-unit-selection";
import { ImageHD } from "@core/image-hd";
import { Image3D } from "@core/image-3d";
import { canSelectUnit } from "@utils/unit-utils";
import { Unit } from "@core/unit";
import { VisualSelectionBox } from "@input/mouse-selection-box";
import { Janitor } from "three-janitor";
import { borrow, Borrowed } from "@utils/object-utils";
import { SurfaceComposer } from "./surface-composer";
import { PostProcessingComposer } from "./postprocessing-composer";

export type OverlayComposer = ReturnType<typeof createOverlayComposer>;

const _intersects: Intersection[] = [];

const _getSelectionUnit = (images: SceneComposer["images"]) => (object: Object3D): Unit | null => {

    if (object instanceof ImageHD || object instanceof Image3D) {
        return canSelectUnit(images.getUnit(object));
    } else if (object.parent) {
        return _getSelectionUnit(images)(object.parent);
    }

    return null;

};

export const createOverlayComposer = (world: World, { terrainExtra, getPlayerColor, images, units, sprites, selectedUnits, scene, simpleIndex }: SceneComposer, surfaces: Borrowed<SurfaceComposer>, views: ViewInputComposer, post: PostProcessingComposer, assets: Assets) => {

    const janitor = new Janitor("OverlayComposer");

    const b_world = borrow(world);

    const unitSelectionBox = createUnitSelectionBox(b_world, views.inputs!.mouse, scene, simpleIndex, _getSelectionUnit(images));
    const selectionDisplayComposer = createSelectionDisplayComposer(assets);
    scene.add(...selectionDisplayComposer.objects);

    const visualBox = janitor.mop(new VisualSelectionBox("#00cc00"), "visualBox");

    world.events.on("box-selection-start", () => visualBox.start(views.inputs!.mouse.clientX, views.inputs!.mouse.clientY));

    world.events.on("box-selection-move", () => visualBox.end(views.inputs!.mouse.clientX, views.inputs!.mouse.clientY));

    world.events.on("box-selection-end", () => visualBox.clear());

    world.events.on("box-selection-enabled", (value) => visualBox.enabled = value);

    const cursorMaterial = new CursorMaterial(assets);
    const cursorGraphics = new Mesh(new PlaneGeometry(1, 1), cursorMaterial);

    cursorGraphics.frustumCulled = false;
    cursorGraphics.matrixAutoUpdate = false;
    cursorGraphics.renderOrder = 1000;

    const minimapMaterial = new MinimapMaterial(...world.map.size, terrainExtra.minimapTex);

    const minimap = new Mesh(new PlaneGeometry(1, 1), minimapMaterial);
    minimap.frustumCulled = false;
    minimap.renderOrder = 1;
    minimap.matrixAutoUpdate = false;

    const rayCast = new Raycaster();
    const [mapWidth, mapHeight] = world.map.size;

    const minimapConsoleMaterial = new BasicOverlayMaterial(assets.minimapConsole.clock);
    const minimapConsole = new Mesh(new PlaneGeometry(1, 1), minimapConsoleMaterial);
    minimapConsole.material.depthTest = false;
    minimapConsole.material.depthWrite = false;
    minimapConsole.material.transparent = true;
    minimapConsole.visible = false;

    minimapConsole.frustumCulled = false;
    minimapConsole.renderOrder = 0;
    minimapConsole.matrixAutoUpdate = false;


    post.overlayScene.add(minimap, cursorGraphics);

    const ignoreOnMinimap = [unitTypes.darkSwarm, unitTypes.disruptionWeb];

    cursorMaterial.uniforms.uResolution.value.set(surfaces.gameSurface!.bufferWidth, surfaces.gameSurface!.bufferHeight);

    const setDimensions = () => {
        const rect = surfaces.gameSurface!.getMinimapDimensions!(world.settings.getState().minimap.scale);

        minimap.updateWorldMatrix(true, true);
        const m4 = new Matrix4().copy(minimap.matrixWorld);

        m4.multiplyMatrices(post.overlayCamera.matrixWorldInverse, m4);
        m4.multiplyMatrices(post.overlayCamera.projectionMatrix, m4);

        const s4 = new Matrix4();
        s4.makeScale(surfaces.gameSurface!.bufferWidth, surfaces.gameSurface!.bufferHeight, 1);

        m4.multiplyMatrices(s4, m4);

        const m3 = new Matrix3().setFromMatrix4(m4);

        gameStore().setDimensions({
            matrix: m3.toArray(),
            minimapWidth: rect.minimapWidth,
            minimapHeight: world.settings.getState().minimap.enabled ? rect.minimapHeight : 0,
        });
    }

    world.events.on("resize", () => {

        applySettings({ settings: world.settings.getState(), rhs: {} });

        setDimensions();

    });

    setDimensions();


    function applySettings({ settings }: WorldEvents["settings-changed"]) {

        minimap.rotation.set(settings.minimap.rotation[0], settings.minimap.rotation[1], settings.minimap.rotation[2])

        minimap.scale.set(settings.minimap.scale, settings.minimap.scale, 1);
        minimap.scale.divide(surfaces.gameSurface!.screenAspect);
        minimap.position.set(settings.minimap.position[0], -settings.minimap.position[1], 0);

        minimapMaterial.uniforms.uOpacity.value = settings.minimap.opacity;
        minimapMaterial.uniforms.uSoftEdges.value = settings.minimap.softEdges ? 1 : 0;
        minimapMaterial.visible = settings.minimap.enabled;
        minimapMaterial.uniformsNeedUpdate = true;

        minimap.updateMatrix();

        minimapConsole.rotation.copy(minimap.rotation);
        minimapConsole.scale.copy(minimap.scale).addScalar(0.1);
        minimapConsole.position.copy(minimap.position);
        minimapConsole.updateMatrix();

        minimapConsoleMaterial.uniforms.uOpacity.value = settings.minimap.opacity;
        minimapConsoleMaterial.uniformsNeedUpdate = true;

        cursorMaterial.uniforms.uResolution.value.set(surfaces.gameSurface!.bufferWidth, surfaces.gameSurface!.bufferHeight);
        cursorMaterial.uniforms.uCursorSize.value = settingsStore().data.graphics.cursorSize;
        cursorMaterial.uniformsNeedUpdate = true;

        setDimensions();

    }

    world.events.on("settings-changed", ({ settings, rhs }) => {

        applySettings({ settings, rhs });

    });

    const mapV = new Vector2(mapWidth, mapHeight);

    const mapAspectF = mapWidth / mapHeight;
    const mapAspect = new Vector2(mapAspectF > 1.0 ? 1.0 / mapAspectF : 1.0, mapAspectF < 1.0 ? mapAspectF : 1.0);
    const bounds = new Vector2(0.5 - 0.5 * mapAspect.y, 0.5 - 0.5 * mapAspect.x);

    let _insideMinimap = false;

    world.events.on("dispose", () => janitor.dispose());

    return {
        unitSelectionBox,
        update(delta: number) {

            unitSelectionBox.enabled = _intersects.length === 0 && !views.inputs!.mouse.interrupted ? world.settings.getState().input.unitSelection : false;

            cursorMaterial.update(delta, views.inputs!.mouse.move, _insideMinimap ? UnitSelectionStatus.None : unitSelectionBox.status);

            unitSelectionBox.update();

            if (unitSelectionBox.isActive || !(world.settings.getState().minimap.interactive && world.settings.getState().minimap.enabled) || views.inputs!.mouse.interrupted) {

                if (_insideMinimap) {

                    world.events.emit("minimap-leave");
                    _insideMinimap = false;

                }

                return;

            }

            rayCast.setFromCamera(views.inputs!.mouse.move, post.overlayCamera);

            _intersects.length = 0;
            minimap.raycast(rayCast, _intersects);

            if (_insideMinimap && _intersects.length === 0) {
                _insideMinimap = false;
                world.events.emit("minimap-leave");
            } else if (!_insideMinimap && _intersects.length > 0) {
                _insideMinimap = true;
                world.events.emit("minimap-enter");
            }

            unitSelectionBox.enabled = _intersects.length === 0;

            if (_intersects.length && _intersects[0].uv) {

                const uv = _intersects[0].uv;

                uv.set((uv.x - bounds.x) / mapAspect.y, (uv.y - bounds.y) / mapAspect.x);

                if (views.inputs!.mouse.move.z > -1) {
                    views.onMinimapDragUpdate!(uv.set(uv.x, 1 - uv.y).subScalar(0.5).multiply(mapV), !!views.inputs!.mouse.clicked, views.inputs!.mouse.move.z);
                }

            }

        },

        onFrame(completedUpgrades: number[][]) {

            selectionDisplayComposer.update(views.primaryCamera!, sprites, completedUpgrades, selectedUnits.toArray());

            minimapMaterial.update(world.fogOfWar.buffer, terrainExtra.creep.minimapImageData, world.fogOfWar.effect.opacity);

            for (const unit of units) {
                if (!ignoreOnMinimap.includes(unit.typeId)) {
                    minimapMaterial.buildUnitMinimap(unit, assets.bwDat.units[unit.typeId], world.fogOfWar, getPlayerColor)
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