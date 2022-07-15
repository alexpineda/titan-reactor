export const inverse = (fn: Function) => (...args: any[]) => !fn(...args);

export const throttleFn = (interval: number) => {
    let lastElapsed = 0;
    return (elapsed: number) => {
        if (elapsed - lastElapsed > interval) {
            lastElapsed = elapsed;
            return true;
        }
        return false;
    }
}