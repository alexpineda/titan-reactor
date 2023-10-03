import create from "zustand/vanilla";
import { log } from "@ipc/log";
import { MathUtils } from "three";

const PROCESS_MAX = 10;

export interface IncrementalProcess {
    id: string;
    label: string;
    max: number;
    current: number;
}

interface ProcessWrapper {
    id: string;
    increment: () => void;
    add( additiona: number ): void;
}

export interface ProcessStore {
    processes: IncrementalProcess[];
    create: ( label: string, max: number ) => ProcessWrapper;
    increment: ( id?: string, current?: number ) => void;
    isComplete: ( id: string ) => boolean;
    isInProgress: ( id: string ) => boolean;
    getTotalProgress: () => number;
    clearCompleted: () => void;
    clearAll: () => void;
    addOrCreate: ( max: number ) => ProcessWrapper;
    _createProcessWrapper: ( id: string, process: IncrementalProcess ) => ProcessWrapper;
}

let _mostRecent: string = "";

/**
 * Loading processes store. Used to track progress of loading and displaying it to the user.
 */
export const useProcessStore = create<ProcessStore>( ( set, get ) => ( {
    processes: [],
    _createProcessWrapper: ( id: string, process: IncrementalProcess ) => ( {
        id,
        increment: () => get().increment( id ),
        add: ( additional: number ) => {
            process.max += additional;
        },
    } ),
    create: ( label: string, max = PROCESS_MAX ) => {
        const id = MathUtils.generateUUID();
        log.debug( "@process/init: " + label );

        performance.mark( `process-${id}` );

        const process = {
            label,
            id,
            current: 0,
            max,
        };

        _mostRecent = id;

        set( ( { processes } ) => ( {
            processes: [ ...processes, process ],
        } ) );

        return get()._createProcessWrapper( id, process );
    },
    addOrCreate: ( max: number ) => {
        const process = get().processes.find( ( p ) => p.id === _mostRecent );
        if ( process ) {
            performance.mark( `process-${process.id}` );
            process.max += max;
            return get()._createProcessWrapper( process.id, process );
        } else {
            return get().create( _mostRecent, max );
        }
    },

    increment: ( id: string = _mostRecent, step = 1 ) => {
        requestAnimationFrame( () => {
            const process = get().processes.find( ( p ) => p.id === id );

            if ( process ) {
                const next = Math.min( process.current + step, process.max );

                set( ( state ) => ( {
                    processes: state.processes.map( ( p ) =>
                        p.id === id ? { ...p, current: next } : p
                    ),
                } ) );

                if ( next === process.max ) {
                    _mostRecent = "";
                    const perf = performance.measure( `process-${id}` );
                    performance.clearMarks( `process-${id}` );
                    performance.clearMeasures( `process-${id}` );
                    log.debug( `@process/complete: ${process.label} ${perf.duration}ms` );
                }
            }
        } );
    },
    clearAll: () => {
        _mostRecent = "";
        set( {
            processes: [],
        } );
    },
    clearCompleted() {
        set( ( { processes } ) => ( {
            processes: processes.filter( ( p ) => !get().isComplete( p.id ) ),
        } ) );
    },
    isInProgress: ( id: string ) =>
        get().processes.some( ( p ) => p.id === id && p.current < p.max ),
    isComplete: ( id: string ) =>
        get().processes.some( ( p ) => p.id === id && p.current >= p.max ),
    getTotalProgress: () => {
        let total = 0,
            process = 0;
        for ( const p of get().processes ) {
            total += p.max;
            process += p.current;
        }
        const t = total > 0 ? process / total : 0;

        return t;
    },
} ) );

export default () => useProcessStore.getState();
