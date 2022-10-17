export class TimeSliceJob<T> {
    processor: ( work: T, next: () => void ) => boolean | undefined;
    #workload: T[];
    #lastUpdate = 0;
    #interval: number;
    #next: () => void;
    #available: boolean;

    timeCompleted: number;

    isComplete() {
        return this.#workload.length === 0;
    }

    constructor(
        processor: ( work: T, next: () => void ) => boolean | undefined,
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
            // eslint-disable-next-line no-empty
            while ( this.processor( this.#workload.pop()!, this.#next ) === false ) {
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
