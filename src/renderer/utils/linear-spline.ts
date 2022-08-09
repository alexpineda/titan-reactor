
type Lerp = (t: number, a: number, b: number) => number;

export const createSpline = (lerp: Lerp, times: number[], values: number[]) => {
    const spline = new LinearSpline(lerp);
    for (let i = 0; i < times.length; i++) {
        spline.add(times[i], values[i]);
    }
    return spline;
}

export class LinearSpline {
    #points: { t: number, v: number }[] = [];
    #lerp: Lerp;

    constructor(lerp: Lerp) {
        this.#lerp = lerp;
    }

    add(t: number, v: number) {
        this.#points.push({ t, v });
    }

    get(t: number) {
        let p1 = 0;

        for (let i = 0; i < this.#points.length; i++) {
            if (this.#points[i].t >= t) {
                break;
            }
            p1 = i;
        }

        const p2 = Math.min(this.#points.length - 1, p1 + 1);

        if (p1 == p2) {
            return this.#points[p1].v;
        }

        return this.#lerp(
            (t - this.#points[p1].t) / (
                this.#points[p2].t - this.#points[p1].t),
            this.#points[p1].v, this.#points[p2].v);
    }
}
