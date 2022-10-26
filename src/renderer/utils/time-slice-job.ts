export class TimeSliceJob<T> {
    processor: ( work: T, next: () => void ) => boolean | void;
    #workload: T[];
    #lastUpdate = 0;
    #interval: number;
    #next: () => void;
    #available: boolean;
    #timer: NodeJS.Timeout | null = null;

    timeCompleted: number;

    isComplete() {
        return this.#workload.length === 0;
    }

    set autoUpdate( val: boolean ) {
        clearInterval( this.#timer! );
        if ( val ) {
            this.#lastUpdate = Date.now();
            this.#timer = setInterval( () => {
                this.update( Date.now() );
            }, this.#interval );
        } else {
            this.#timer = null;
        }
    }

    constructor(
        processor: ( work: T, next: () => void ) => boolean | void,
        workload: T[],
        interval: number
    ) {
        this.processor = processor;
        this.#interval = interval;
        this.#workload = workload;
        this.#available = true;
        this.#next = () => {
            this.#available = true;
        };
        this.timeCompleted = 0;
    }

    addWork( work: T[] | T ) {
        if ( Array.isArray( work ) ) {
            this.#workload.push( ...work );
        } else {
            this.#workload.push( work );
        }
    }

    update( elapsed: number ) {
        if (
            elapsed - this.#lastUpdate > this.#interval &&
            this.#available &&
            !this.isComplete()
        ) {
            const _isComplete = this.isComplete();
            this.#available = false;
            while ( this.processor( this.#workload.pop()!, this.#next ) === false ) {
                this.#available = true;
                if ( this.isComplete() ) {
                    break;
                }
            }
            this.#lastUpdate = elapsed;
            if ( _isComplete !== this.isComplete() && this.isComplete() ) {
                this.timeCompleted = elapsed;
            }
        }
    }

    dispose() {
        this.#workload.length = 0;
    }
}
