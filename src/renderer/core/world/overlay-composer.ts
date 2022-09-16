import { CursorMaterial } from "@image/effects/cursor-material";
import { IgnoreCameraBasicMaterial, MinimapMaterial } from "@render/minimap-material";
import { unitTypes } from "common/enums";
import { Assets } from "@image/assets";
import { Intersection, Mesh, MeshBasicMaterial, PlaneBufferGeometry, Raycaster, Scene, Vector2, Vector3 } from "three";
import { InputComposer } from "./input-composer";
import { SceneComposer } from "./scene-composer";
import { SurfaceComposer } from "./surface-composer";
import { World, WorldEvents } from "./world";
import fragmentShader from "../../render/minimap-frag.glsl";
import vertexShader from "../../render/minimap-vert.glsl";
import { ViewComposer } from "./view-composer";
import throttle from "lodash.throttle";

export type OverlayComposer = ReturnType<typeof createOverlayComposer>;

let _intersects: Intersection[] = [];

export const createOverlayComposer = ({ map, fogOfWar, events, settings }: World, { terrainExtra, getPlayerColor, units }: SceneComposer, { gameSurface }: SurfaceComposer, inputs: InputComposer, viewComposer: ViewComposer, assets: Assets) => {

    const overlayGroup = new Scene();


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

    const minimapConsole = new Mesh(new PlaneBufferGeometry(1, 1), new IgnoreCameraBasicMaterial({ map: assets.minimapConsole.square }));
    minimapConsole.frustumCulled = false;
    minimapConsole.renderOrder = 2;
    minimapConsole.matrixAutoUpdate = false;

    const minimapClockConsole = new Mesh(new PlaneBufferGeometry(1, 1), new MeshBasicMaterial({ map: assets.minimapConsole.clock }));
    minimapConsole.frustumCulled = false;
    minimapConsole.renderOrder = 0;

    overlayGroup.add(minimap, cursorGraphics);

    const ignoreOnMinimap = [unitTypes.darkSwarm, unitTypes.disruptionWeb];

    cursorMaterial.uniforms.uResolution.value.set(gameSurface.bufferWidth, gameSurface.bufferHeight);

    events.on("resize", (surface) => {

        console.log("overlay:resize", surface)
        applySettings({ settings: settings.getState(), rhs: {} });
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
        // ignore the built in material camera
        minimap.matrixWorld.copy(minimapMaterial.localMatrix);

        minimapConsole.position.copy(minimapMaterial.position).add(new Vector3(0, 0, 0));
        minimapConsole.scale.copy(minimapMaterial.scale).multiplyScalar(1.5);
        minimapConsole.rotation.copy(minimapMaterial.rotation);
        minimapMaterial.applyViewMatrix(minimapConsole.matrixWorld, minimapConsole.matrix, minimapConsole.scale, minimapConsole.position, minimapConsole.rotation);

        cursorMaterial.uniforms.uResolution.value.set(gameSurface.bufferWidth, gameSurface.bufferHeight);
        cursorMaterial.uniformsNeedUpdate = true;

        // minimapConsole.visible = settings.game.minimap.enabled && !settings.game.minimap.softEdges;
        // minimapConsole.material.opacity = settings.game.minimap.opacity;
    }

    events.on("settings-changed", ({ settings, rhs }) => {

        applySettings({ settings, rhs });

    });

    const mapV = new Vector2(map.size[0], map.size[1]);

    const throttledMinimapUpdate = throttle(() => {
        rayCast.setFromCamera(_mousePositionCopy, minimapMaterial.camera);

        _intersects.length = 0;
        minimap.matrixWorld.copy(minimapMaterial.localMatrix);
        minimap.raycast(rayCast, _intersects);

        inputs.unitSelectionBox.enabled = _intersects.length === 0;

        if (_intersects.length && _intersects[0].uv) {
            if (_mousePositionCopy.z === -1) {
                minimapMaterial.uniforms.uOpacity.value = Math.max(settings.getState().minimap.opacity * 1.5);
                minimapMaterial.uniformsNeedUpdate = true;
            } else {
                viewComposer.onMinimapDragUpdate(_intersects[0].uv.set(_intersects[0].uv.x, 1 - _intersects[0].uv.y).subScalar(0.5).multiply(mapV), !!_mouseClicked, _mousePositionCopy.z);
            }

        }
        _copiesNeedUpdate = true;

    }, 100);

    const _mousePositionCopy = new Vector3();
    let _mouseClicked = false;
    let _copiesNeedUpdate = true;

    return {
        overlayGroup,
        update(delta: number) {

            cursorMaterial.update(delta, inputs.mouse.position, inputs.unitSelectionBox.status);

            if (settings.getState().minimap.interactive && settings.getState().minimap.enabled && !inputs.unitSelectionBox.isActive) {
                if (_copiesNeedUpdate) {
                    _mousePositionCopy.copy(inputs.mouse.position);
                    _mouseClicked = !!inputs.mouse.clicked;
                    _copiesNeedUpdate = false;
                }
                throttledMinimapUpdate();
            }

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