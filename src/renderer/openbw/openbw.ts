import initializeWASM from "./titan.wasm.js";
import OpenBWFileList from "./openbw-filelist";
import { Timer } from "@utils/timer";
import { readFileSync } from "fs";
import path from "path";
import { OpenBWWasm, ReadFile } from "common/types";
import { mix } from "@utils/object-utils.js";

/**
 * @public
 */
export interface OpenBW extends OpenBWWasm {}

/**
 * @public
 * An interface layer between the OpenBW WASM module and the rest of the application.
 */
export class OpenBW implements OpenBW {
    #wasm!: OpenBWWasm;
    running = false;
    files?: OpenBWFileList;

    #isReplay = false;
    #isSandbox = false;
    #timer = new Timer();

    unitGenerationSize = 3;

    /**
     * Load the WASM module and initialize the OpenBW instance.
     */
    async init() {
        this.#wasm = ( await initializeWASM( {
            locateFile: ( filename: string ) => {
                if ( filename === "titan.worker.js" ) {
                    return path.join( __static, "titan.worker.js" );
                }
            },
            wasmBinary: readFileSync( path.join( __static, "titan.wasm" ) ),
        } ) ) as OpenBWWasm;
        mix( this, this.#wasm );
    }

    #withOpenBWError( e: unknown ) {
        if ( typeof e === "number" ) {
            throw new Error( this.#wasm.getExceptionMessage( e ) );
        } else {
            throw e;
        }
    }

    isReplay() {
        return this.#isReplay;
    }

    isSandboxMode() {
        return this.#isSandbox;
    }

    setSandboxMode = ( sandbox: boolean ) => {
        if ( !this.#isReplay ) {
            return;
        }
        return ( this.#isSandbox = sandbox );
    };

    /**
     * @param buffer the replay file buffer
     */
    loadReplay( buffer: Buffer ) {
        this.#isReplay = true;
        this.#isSandbox = false;

        try {
            const buf = this.#wasm.allocate( buffer, this.#wasm.ALLOC_NORMAL );
            this.#wasm._load_replay( buf, buffer.length );
            this.#wasm._free( buf );
        } catch ( e ) {
            this.#withOpenBWError( e );
        }
    }

    /**
     * OpenBW uses the height map to determine Y coordinates for units so that we don't have to.
     *
     * @param data the greyscale height map data
     * @param width width in px
     * @param height height inpx
     */
    uploadHeightMap = ( data: Uint8ClampedArray, width: number, height: number ) => {
        try {
            const heightMapBuf = this.#wasm.allocate( data, this.#wasm.ALLOC_NORMAL );
            this.#wasm._upload_height_map( heightMapBuf, data.length, width, height );
            this.#wasm._free( heightMapBuf );
        } catch ( e ) {
            this.#withOpenBWError( e );
        }
    };

    /**
     * @param buffer the map file buffer
     */
    loadMap( buffer: Buffer ) {
        this.#isReplay = false;
        this.#isSandbox = true;

        try {
            const buf = this.#wasm.allocate( buffer, this.#wasm.ALLOC_NORMAL );
            this.#wasm._load_map( buf, buffer.length );
            this.#wasm._free( buf );
        } catch ( e ) {
            this.#withOpenBWError( e );
        }
    }

    /**
     * Called after init() to call main() and provide data files.
     */
    async start( readFile: ReadFile ) {
        if ( this.running ) return;

        this.files = new OpenBWFileList( this.#wasm );
        await this.files.loadBuffers( readFile );
        try {
            this.#wasm.callMain();
            this.running = true;
        } catch ( e ) {
            this.#withOpenBWError( e );
        }
    }

    /**
     * Increments the game frame where openbw will run until the next frame.
     * If the game is in sandbox mode, the game will run at 24 fps.
     * @returns the game frame number
     */
    nextFrame = () => {
        if ( this.#isSandbox ) {
            this.#timer.update();
            if ( this.#timer.getElapsed() > 42 ) {
                this.#timer.resetElapsed();
                return this.nextFrameNoAdvance();
            }
            return this.getCurrentFrame();
        }
        return this.#wasm._next_frame();
    };

    nextFrameSafe = () => {
        try {
            return this.nextFrame();
        } catch ( e ) {
            this.#withOpenBWError( e );
            return 0;
        }
    };

    nextFrameNoAdvance() {
        return this.#wasm._next_no_replay();
    }

    setGameSpeed( speed: number ) {
        return this.#wasm._replay_set_value( 0, speed );
    }
    getGameSpeed() {
        return this.#wasm._replay_get_value( 0 );
    }

    setCurrentFrame( frame: number ) {
        return this.#wasm._replay_set_value( 2, frame );
    }
    getCurrentFrame() {
        return this.#wasm._replay_get_value( 2 );
    }

    setCurrentReplayFrame( frame: number ) {
        return this.#wasm._replay_set_value( 3, frame );
    }
    getCurrentReplayFrame() {
        return this.#wasm._replay_get_value( 3 );
    }

    isPaused() {
        return this.#wasm._replay_get_value( 1 ) === 1;
    }
    setPaused( paused: boolean ) {
        return this.#wasm._replay_set_value( 1, paused ? 1 : 0 );
    }

    getPlayersAddress() {
        return this.#wasm._get_buffer( 10 );
    }

    setUnitLimits( unitLimits: number ) {
        this.unitGenerationSize = unitLimits === 1700 ? 5 : 3;
    }

    /**
     * Updates fog of war and creep data
     */
    generateFrame() {
        this.#wasm._generate_frame();
    }

    getFowSize() {
        return this.#wasm._counts( 10 );
    }
    getFowPtr() {
        return this.#wasm._get_buffer( 16 );
    }

    setPlayerVisibility( visibility: number ) {
        this.#wasm._set_player_visibility( visibility );
    }

    getCreepSize() {
        return this.#wasm._counts( 2 );
    }

    getCreepPtr() {
        return this.#wasm._get_buffer( 14 );
    }

    getCreepEdgesSize() {
        return this.#wasm._counts( 3 );
    }
    getCreepEdgesPtr() {
        return this.#wasm._get_buffer( 15 );
    }

    getTilesPtr() {
        return this.#wasm._get_buffer( 0 );
    }

    getTilesSize() {
        return this.#wasm._counts( 0 );
    }

    getSoundObjects() {
        return this.#wasm.get_util_funcs().get_sounds();
    }

    getLastError() {
        return this.#wasm._counts( 0 );
    }

    getLastErrorMessage() {
        switch ( this.getLastError() ) {
            case 60:
                return "Terrain displaces unit";
            case 61:
                return "Cannot create more units";
            case 62:
                return "Unable to create unit";
        }
        return null;
    }

    getSpritesOnTileLineSize() {
        return this.#wasm._counts( 14 );
    }
    getSpritesOnTileLineAddress() {
        return this.#wasm._get_buffer( 1 );
    }

    getUnitsAddr() {
        return this.#wasm._get_buffer( 2 );
    }

    getBulletsAddress() {
        return this.#wasm._get_buffer( 6 );
    }
    getBulletsDeletedCount() {
        return this.#wasm._counts( 18 );
    }
    getBulletsDeletedAddress() {
        return this.#wasm._get_buffer( 7 );
    }

    getSoundsAddress() {
        return this.#wasm._get_buffer( 11 );
    }
    getSoundsCount() {
        return this.#wasm._counts( 6 );
    }

    getIScriptProgramDataSize() {
        return this.#wasm._counts( 12 );
    }

    getIScriptProgramDataAddress() {
        return this.#wasm._get_buffer( 12 );
    }
}
