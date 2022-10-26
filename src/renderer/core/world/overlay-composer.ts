import { CursorMaterial } from "@image/effects/cursor-material";
import { BasicOverlayMaterial, MinimapMaterial } from "@render/minimap-material";
import { unitTypes } from "common/enums";
import { Assets } from "@image/assets";
import {
    Intersection,
    Matrix3,
    Matrix4,
    Mesh,
    PlaneGeometry,
    Raycaster,
    Vector2,
} from "three";
import { SceneComposer } from "./scene-composer";
import { World } from "./world";
import { WorldEvents } from "./world-events";
import gameStore from "@stores/game-store";
import { settingsStore } from "@stores/settings-store";
import { createSelectionDisplayComposer } from "@core/selection-objects";
import { UnitSelectionStatus } from "@input/create-unit-selection";
import { VisualSelectionBox } from "@input/mouse-selection-box";
import { Janitor } from "three-janitor";
import { SurfaceComposer } from "./surface-composer";
import { PostProcessingComposer } from "./postprocessing-composer";
import { InputsComposer } from "./input-composer";

export type OverlayComposer = {
    minimapUv: Vector2 | undefined;
    insideMinimap: boolean;
    update( delta: number ): void;
    onFrame( completedUpgrades: number[][] ): void;
};

const _mmIntersect: Intersection[] = [];

export const createOverlayComposer = (
    world: World,
    {
        terrainExtra,
        getPlayerColor,
        units,
        sprites,
        selectedUnits,
        scene,
    }: SceneComposer,
    surfaces: SurfaceComposer,
    inputs: InputsComposer,
    post: PostProcessingComposer,
    assets: Assets
): OverlayComposer => {
    const janitor = new Janitor( "OverlayComposer" );

    const selectionDisplayComposer = createSelectionDisplayComposer( assets );
    scene.add( ...selectionDisplayComposer.objects );

    const visualBox = janitor.mop( new VisualSelectionBox( "#00cc00" ), "visualBox" );

    world.events.on( "box-selection-start", () =>
        visualBox.start( inputs.mouse.clientX, inputs.mouse.clientY )
    );

    world.events.on( "box-selection-move", () =>
        visualBox.end( inputs.mouse.clientX, inputs.mouse.clientY )
    );

    world.events.on( "box-selection-end", () => visualBox.clear() );

    world.events.on( "box-selection-enabled", ( value ) => ( visualBox.enabled = value ) );

    const cursorMaterial = new CursorMaterial( assets );
    const cursorGraphics = new Mesh( new PlaneGeometry( 1, 1 ), cursorMaterial );

    cursorGraphics.frustumCulled = false;
    cursorGraphics.matrixAutoUpdate = false;
    cursorGraphics.renderOrder = 1000;

    const minimapMaterial = new MinimapMaterial(
        ...world.map.size,
        terrainExtra.minimapTex
    );

    const minimap = new Mesh( new PlaneGeometry( 1, 1 ), minimapMaterial );
    minimap.frustumCulled = false;
    minimap.renderOrder = 1;
    minimap.matrixAutoUpdate = false;

    const rayCast = new Raycaster();
    const [ mapWidth, mapHeight ] = world.map.size;

    const minimapConsoleMaterial = new BasicOverlayMaterial(
        assets.minimapConsole.clock
    );
    const minimapConsole = new Mesh( new PlaneGeometry( 1, 1 ), minimapConsoleMaterial );
    minimapConsole.material.depthTest = false;
    minimapConsole.material.depthWrite = false;
    minimapConsole.material.transparent = true;
    minimapConsole.visible = false;

    minimapConsole.frustumCulled = false;
    minimapConsole.renderOrder = 0;
    minimapConsole.matrixAutoUpdate = false;

    post.overlayScene.add( minimap, cursorGraphics );

    const ignoreOnMinimap = [ unitTypes.darkSwarm, unitTypes.disruptionWeb ];

    cursorMaterial.uniforms.uResolution.value.set(
        surfaces.gameSurface.bufferWidth,
        surfaces.gameSurface.bufferHeight
    );

    const setDimensions = () => {
        const rect = surfaces.gameSurface.getMinimapDimensions(
            world.settings.getState().minimap.scale
        );

        minimap.updateWorldMatrix( true, true );
        const m4 = new Matrix4().copy( minimap.matrixWorld );

        m4.multiplyMatrices( post.overlayCamera.matrixWorldInverse, m4 );
        m4.multiplyMatrices( post.overlayCamera.projectionMatrix, m4 );

        const s4 = new Matrix4();
        s4.makeScale(
            surfaces.gameSurface.bufferWidth,
            surfaces.gameSurface.bufferHeight,
            1
        );

        m4.multiplyMatrices( s4, m4 );

        const m3 = new Matrix3().setFromMatrix4( m4 );

        gameStore().setDimensions( {
            matrix: m3.toArray(),
            minimapWidth: rect.minimapWidth,
            minimapHeight: world.settings.getState().minimap.enabled
                ? rect.minimapHeight
                : 0,
        } );
    };

    world.events.on( "resize", () => {
        applySettings( { settings: world.settings.getState(), rhs: {} } );

        setDimensions();
    } );

    // setDimensions();

    function applySettings( { settings }: WorldEvents["settings-changed"] ) {
        minimap.rotation.set(
            settings.minimap.rotation[0],
            settings.minimap.rotation[1],
            settings.minimap.rotation[2]
        );

        minimap.scale.set( settings.minimap.scale, settings.minimap.scale, 1 );
        minimap.scale.divide( surfaces.gameSurface.screenAspect );
        minimap.position.set(
            settings.minimap.position[0],
            -settings.minimap.position[1],
            0
        );

        minimapMaterial.uniforms.uOpacity.value = settings.minimap.opacity;
        minimapMaterial.uniforms.uSoftEdges.value = settings.minimap.softEdges ? 1 : 0;
        minimapMaterial.visible = settings.minimap.enabled;
        minimapMaterial.uniformsNeedUpdate = true;

        minimap.updateMatrix();

        minimapConsole.rotation.copy( minimap.rotation );
        minimapConsole.scale.copy( minimap.scale ).addScalar( 0.1 );
        minimapConsole.position.copy( minimap.position );
        minimapConsole.updateMatrix();

        minimapConsoleMaterial.uniforms.uOpacity.value = settings.minimap.opacity;
        minimapConsoleMaterial.uniformsNeedUpdate = true;

        cursorMaterial.uniforms.uResolution.value.set(
            surfaces.gameSurface.bufferWidth,
            surfaces.gameSurface.bufferHeight
        );
        cursorMaterial.uniforms.uCursorSize.value =
            settingsStore().data.graphics.cursorSize;
        cursorMaterial.uniformsNeedUpdate = true;

        cursorGraphics.visible = settings.input.cursorVisible;

        setDimensions();
    }

    world.events.on( "settings-changed", ( { settings, rhs } ) => {
        applySettings( { settings, rhs } );
    } );

    const mapV = new Vector2( mapWidth, mapHeight );

    const mapAspectF = mapWidth / mapHeight;
    const mapAspect = new Vector2(
        mapAspectF > 1.0 ? 1.0 / mapAspectF : 1.0,
        mapAspectF < 1.0 ? mapAspectF : 1.0
    );
    const bounds = new Vector2( 0.5 - 0.5 * mapAspect.y, 0.5 - 0.5 * mapAspect.x );

    world.events.on( "dispose", () => janitor.dispose() );

    let _minimapUv: Vector2 | undefined = undefined,
        _insideMinimap = false;

    const _intersectMinimap = () => {
        rayCast.setFromCamera( inputs.mouse.move, post.overlayCamera );

        _mmIntersect.length = 0;
        minimap.raycast( rayCast, _mmIntersect );

        if ( _insideMinimap && _mmIntersect.length === 0 ) {
            _insideMinimap = false;
            world.events.emit( "minimap-leave" );
        } else if ( !_insideMinimap && _mmIntersect.length > 0 && _mmIntersect[0].uv ) {
            _insideMinimap = true;
            world.events.emit( "minimap-enter" );
        }

        if ( _mmIntersect.length && _mmIntersect[0].uv ) {
            const uv = _mmIntersect[0].uv;

            uv.set( ( uv.x - bounds.x ) / mapAspect.y, ( uv.y - bounds.y ) / mapAspect.x );

            return uv
                .set( uv.x, 1 - uv.y )
                .subScalar( 0.5 )
                .multiply( mapV );
        }
    };

    return {
        get insideMinimap() {
            return _insideMinimap;
        },
        set insideMinimap( val: boolean ) {
            _insideMinimap = val;
        },
        get minimapUv() {
            return _minimapUv;
        },
        update( delta: number ) {
            cursorMaterial.update(
                delta,
                inputs.mouse.move,
                _insideMinimap && world.settings.vars.minimap.interactive()
                    ? UnitSelectionStatus.None
                    : inputs.unitSelectionBox.status
            );

            if (
                !world.settings.getState().minimap.interactive ||
                !world.settings.getState().minimap.enabled
            ) {
                _minimapUv = undefined;
                if ( _insideMinimap ) {
                    _insideMinimap = false;
                    world.events.emit( "minimap-leave" );
                }
                return;
            }

            _minimapUv = _intersectMinimap();
        },

        onFrame( completedUpgrades: number[][] ) {
            selectionDisplayComposer.update(
                sprites,
                completedUpgrades,
                selectedUnits._dangerousArray
            );

            minimapMaterial.update(
                world.fogOfWar.buffer,
                terrainExtra.creep.minimapImageData,
                world.fogOfWar.effect.opacity
            );

            for ( const unit of units ) {
                if ( !ignoreOnMinimap.includes( unit.typeId ) ) {
                    minimapMaterial.buildUnitMinimap(
                        unit,
                        assets.bwDat.units[unit.typeId],
                        world.fogOfWar,
                        getPlayerColor
                    );
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
        },
    };
};
