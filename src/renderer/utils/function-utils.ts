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

export const normalizePluginConfiguration = (config: any) => {
    const configCopy: any = {};
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