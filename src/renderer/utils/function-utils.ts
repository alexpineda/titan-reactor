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

export const normalizePluginConfiguration = (config: Record<string, any>) => {
    const configCopy: Record<string, any> = {};
    Object.keys(config).forEach((key) => {
        if (config[key]?.value !== undefined) {
            if (config[key]?.factor !== undefined) {
                configCopy[key] = config[key].value * config[key].factor;
            } else {
                configCopy[key] = config[key].value;
            }
        }
    });
    return configCopy;
}

export function last<T extends any[]>(array: T) {
    var length = array == null ? 0 : array.length;
    return length ? array[length - 1] : undefined;
}