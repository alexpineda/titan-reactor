export class Timer {
    #previousTime = 0;
    #currentTime = 0;

    #delta = 0;
    #elapsed = 0;

    #timescale = 1;

    #useFixedDelta = false;
    #fixedDelta = 16.67; // ms, corresponds to approx. 60 FPS

    #usePageVisibilityAPI = false;
    #pageVisibilityHandler?: () => void;

    constructor() {
        // use Page Visibility API to avoid large time delta values

        this.#usePageVisibilityAPI =
            typeof document !== "undefined" && document.hidden !== undefined;

        if ( this.#usePageVisibilityAPI ) {
            document.addEventListener(
                "visibilitychange",
                //TODO add janitor since this leaks
                () => this.#handleVisibilityChange(),
                false
            );
        }
    }

    #handleVisibilityChange() {
        if ( !document.hidden ) this.reset();
    }

    disableFixedDelta() {
        this.#useFixedDelta = false;

        return this;
    }

    dispose() {
        if ( this.#usePageVisibilityAPI ) {
            document.removeEventListener(
                "visibilitychange",
                this.#pageVisibilityHandler!
            );
        }

        return this;
    }

    enableFixedDelta() {
        this.#useFixedDelta = true;

        return this;
    }

    getDelta() {
        return this.#delta;
    }

    getElapsed() {
        return this.#elapsed;
    }

    getFixedDelta() {
        return this.#fixedDelta;
    }

    getTimescale() {
        return this.#timescale;
    }

    reset() {
        this.#currentTime = this._now();

        return this;
    }

    resetElapsed() {
        this.#elapsed = 0;

        return this;
    }

    setFixedDelta( fixedDelta: number ) {
        this.#fixedDelta = fixedDelta;

        return this;
    }

    setTimescale( timescale: number ) {
        this.#timescale = timescale;

        return this;
    }

    update( elapsed?: number ) {
        if ( this.#useFixedDelta ) {
            this.#delta = this.#fixedDelta;
        } else {
            this.#previousTime = this.#currentTime;
            this.#currentTime = elapsed ?? this._now();

            this.#delta = this.#currentTime - this.#previousTime;
        }

        this.#delta *= this.#timescale;

        this.#elapsed += this.#delta; // _elapsed is the accumulation of all previous deltas

        return this;
    }

    // private

    _now() {
        return ( typeof performance === "undefined" ? Date : performance ).now();
    }
}
