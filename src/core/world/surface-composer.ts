import GameSurface from "@render/game-surface";
import { renderComposer } from "@render/render-composer";
import { settingsStore, useSettingsStore } from "@stores/settings-store";
import { Janitor } from "three-janitor";
import debounce from "lodash.debounce";
import Chk from "bw-chk";
import { WorldEvents } from "./world-events";
import { TypeEmitter } from "@utils/type-emitter";

export type SurfaceComposer = ReturnType<typeof createSurfaceComposer>;
export type SurfaceComposerApi = SurfaceComposer["api"];

/**
 * Creates the game canvases, listeners, and resizers.
 * @param world 
 * @returns 
 */
export const createSurfaceComposer = ( map: Chk, events: TypeEmitter<WorldEvents> ) => {
    const janitor = new Janitor( "SurfaceComposer" );
    const gameSurface = janitor.mop(
        new GameSurface(
            ...map.size,
            renderComposer.srcCanvas
        ),
        "GameSurface"
    );

    gameSurface.canvas.style.cursor = "none";
    gameSurface.setDimensions(
        window.innerWidth,
        window.innerHeight,
        settingsStore().data.graphics.pixelRatio
    );

    renderComposer.dstCanvas = gameSurface.canvas;

    const _sceneResizeHandler = () => {
        gameSurface.setDimensions(
            window.innerWidth,
            window.innerHeight,
            settingsStore().data.graphics.pixelRatio
        );

        events.emit( "resize", gameSurface );
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

    events.on( "dispose", () => {
        janitor.dispose();
    } );

    gameSurface.hide();

    return {
        gameSurface,
        resize,
        mount() {
            janitor.mop( document.body.appendChild( gameSurface.canvas ), "appendChild" );
            gameSurface.show();
        },
        api: ( ( surfaceRef: WeakRef<typeof gameSurface> ) => ( {
            get surface() {
                return surfaceRef.deref();
            },
        } ) )( new WeakRef( gameSurface ) ),
    };
};
