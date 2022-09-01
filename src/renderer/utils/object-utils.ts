import * as log from "@ipc/log";
import { Object3D } from "three";

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

Object3D.prototype.copy = function (source: Object3D, recursive = true) {

    this.name = source.name;

    this.up.copy(source.up);
    this.position.copy(source.position);
    this.rotation.order = source.rotation.order;
    this.quaternion.copy(source.quaternion);
    this.scale.copy(source.scale);

    this.matrix.copy(source.matrix);
    this.matrixWorld.copy(source.matrixWorld);

    this.matrixAutoUpdate = source.matrixAutoUpdate;
    this.matrixWorldNeedsUpdate = source.matrixWorldNeedsUpdate;

    this.layers.mask = source.layers.mask;
    this.visible = source.visible;

    this.castShadow = source.castShadow;
    this.receiveShadow = source.receiveShadow;

    this.frustumCulled = source.frustumCulled;
    this.renderOrder = source.renderOrder;

    if (recursive === true) {

        for (let i = 0; i < source.children.length; i++) {

            const child = source.children[i];
            this.add(child.clone());

        }

    }

    return this;

}