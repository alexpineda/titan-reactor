import * as log from "@ipc/log";

// https://zellwk.com/blog/copy-properties-of-one-object-to-another-object/
export function mix(dest: {}, ...sources: {}[]) {
    for (const source of sources) {
        const props = Object.keys(source)
        for (const prop of props) {
            const descriptor = Object.getOwnPropertyDescriptor(source, prop)
            if (descriptor) {
                Object.defineProperty(dest, prop, descriptor)
            } else {
                log.error(`mix: property ${prop} not found in source`)
            }
        }
    }
    return dest;
}

export function mixAll(dest: {}, ...sources: {}[]) {
    if (sources[0] === null) {
        return;
    }
    for (const source of sources) {
        const props = Object.keys(source)
        for (const prop of props) {
            const descriptor = Object.getOwnPropertyDescriptor(source, prop)
            if (descriptor) {
                Object.defineProperty(dest, prop, descriptor)
            } else {
                log.error(`mix: property ${prop} not found in source`)
            }
        }
        mixAll(dest, Object.getPrototypeOf(source))
    }
    return dest;
}

// https://stackoverflow.com/questions/60400066/how-to-enumerate-discover-getters-and-setters-in-javascript
const getPropertyDescriptor = (source: {}, prop: string): null | undefined | PropertyDescriptor => {
    if (source === null) {
        return null;
    }
    const descriptor = Object.getOwnPropertyDescriptor(source, prop)
    if (descriptor == undefined) {
        return getPropertyDescriptor(Object.getPrototypeOf(source), prop)
    }
    return descriptor;
}

export function mixOnly(dest: {}, source: {}, props: string[], alias: Record<string, string> = {}) {
    for (const prop of props) {
        const descriptor = getPropertyDescriptor(source, prop)
        if (descriptor) {
            Object.defineProperty(dest, alias[prop] ?? prop, {
                ...descriptor,
                enumerable: true
            })
        } else {
            log.error(`mixOnly: property ${prop} not found in source`)
        }
    }
    return dest;
}