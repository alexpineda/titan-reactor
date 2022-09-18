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

export type Borrowed<T> = { [key in keyof T]: T[key] | undefined };

function borrowProperty(descriptor: PropertyDescriptor, source: any, key: string, result: any) {


    if (descriptor.get) {

        throw new Error("borrowProperty: getters not supported yet")

    } else if (descriptor.value !== undefined) {

        const ref = new WeakRef(source[key]);

        Object.defineProperty(result, key, {
            enumerable: true,
            configurable: false,
            get: () => ref.deref(),
        });

    }

    return true;
}

interface BorrowOptions {
    ancestors: number;
    descendents: number;
    keep: string[];
    target: {}
}

// Converts property descriptors to WeakRef accessors
export function borrow<T extends { [key: string]: any }>(source: T, { ancestors, descendents, keep, target }: BorrowOptions = { ancestors: 0, descendents: 0, keep: [], target: {} }): Borrowed<T> {

    for (const key in source) {

        const descriptor = Object.getOwnPropertyDescriptor(source, key);

        if (descriptor) {

            if (descendents) {

                const result = borrow(source[key], { ancestors: 0, descendents: descendents - 1, keep, target });

                Object.defineProperty(target, key, {
                    enumerable: true,
                    configurable: false,
                    get: () => result,
                });

            } else {

                borrowProperty(descriptor, source, key, target);

            }

        } else {

            if (ancestors > 0 && Object.getPrototypeOf(source)) {

                borrow(Object.getPrototypeOf(source), { ancestors: ancestors - 1, descendents: 0, keep, target });

            }

        }

    }

    return target as Borrowed<T>;

}

export function weak<T extends {}>(o: T) {
    return new WeakRef(o);
}

export type Exposed<T, K extends keyof T> = { [key in K]: T[K] };

export type ExposeOptions = {
    asValues: boolean;
}

// expose only keys, including prototype chain
export function expose<T extends { [key: string]: any }, K extends keyof T>(source: T, keys: K[], { asValues }: ExposeOptions = { asValues: true }): Exposed<T, K> {

    const result = {} as Exposed<T, K>;

    for (const key of keys) {

        if (asValues) {

            Object.defineProperty(result, key, {
                configurable: false,
                enumerable: true,
                value: source[key]
            })

        } else {

            Object.defineProperty(result, key, {
                configurable: false,
                enumerable: true,
                get: () => source[key],
            })

        }

    }

    return result;

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

export const arrayOverwriteMerge = (_: any, sourceArray: any) => sourceArray;
