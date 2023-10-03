import GameSurface from "@render/game-surface";
import { renderComposer } from "@render/render-composer";
import { settingsStore, useSettingsStore } from "@stores/settings-store";
import { Janitor } from "three-janitor";
import debounce from "lodash.debounce";
import { World } from "./world";

export type SurfaceComposer = ReturnType<typeof createSurfaceComposer>;
export type SurfaceComposerApi = SurfaceComposer["api"];

/**
 * Creates the game canvases, listeners, and resizers.
 * @param world 
 * @returns 
 */
export const createSurfaceComposer = ( world: World ) => {
    const janitor = new Janitor( "SurfaceComposer" );
    const gameSurface = janitor.mop(
        new GameSurface(
            ...world.map.size,
            renderComposer.getWebGLRenderer().domElement
        ),
        "GameSurface"
    );

    gameSurface.canvas.style.cursor = "none";
    gameSurface.setDimensions(
        window.innerWidth,
        window.innerHeight,
        settingsStore().data.graphics.pixelRatio
    );
    janitor.mop( document.body.appendChild( gameSurface.canvas ), "appendChild" );

    renderComposer.targetSurface = gameSurface;

    const _sceneResizeHandler = () => {
        gameSurface.setDimensions(
            window.innerWidth,
            window.innerHeight,
            settingsStore().data.graphics.pixelRatio
        );

        renderComposer.setSize( gameSurface.bufferWidth, gameSurface.bufferHeight );

        world.events.emit( "resize", gameSurface );
    };

    const sceneResizeHandler = debounce( () => {
        _sceneResizeHandler();
    }, 100 );

    janitor.addEventListener(
        window,
        "resize",
        "sceneResizeHandler",
        sceneResizeHandler,
        {
            passive: true,
        }
    );

    const resize = ( immediate = false ) => {
        if ( immediate ) {
            _sceneResizeHandler();
        } else {
            sceneResizeHandler();
        }
    };

    janitor.mop(
        useSettingsStore.subscribe( ( settings ) => {
            if ( settings.data.graphics.pixelRatio !== gameSurface.pixelRatio ) {
                sceneResizeHandler();
            }
        } ),
        "useSettingsStore.subscribe"
    );

    world.events.on( "dispose", () => {
        janitor.dispose();
    } );

    return {
        gameSurface,
        resize,
        api: ( ( surfaceRef: WeakRef<typeof gameSurface> ) => ( {
            togglePointerLock: ( val: boolean ) => {
                const surface = surfaceRef.deref();
                if ( surface ) {
                    surface.togglePointerLock( val );
                }
            },
            isPointerLockLost() {
                const surface = surfaceRef.deref();
                if ( surface ) {
                    return surface.isPointerLockLost();
                }
                return false;
            },
        } ) )( new WeakRef( gameSurface ) ),
    };
};
