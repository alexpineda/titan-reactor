import { log } from "@ipc/log";
import { withErrorMessage } from "common/utils/with-error-message";
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

function borrowProperty(descriptor: PropertyDescriptor, source: any, key: string, result: any, retainGetters: boolean) {


    if (descriptor.get) {

        // danger zone 
        if (retainGetters) {

            try {
                Object.defineProperty(result, key, {
                    enumerable: true,
                    configurable: false,
                    get: () => descriptor.get!()
                });

                log.warning(`borrowing getter ${key}`);

            } catch (e) {

                log.error(withErrorMessage(e, `borrow: failed to borrow getter ${key} from source`));

            }

        } else {

            throw new Error("borrowProperty: getters not supported")

        }

    } else if (descriptor.value !== undefined) {

        try {
            const ref = new WeakRef(source[key]);

            Object.defineProperty(result, key, {
                enumerable: true,
                configurable: false,
                get: () => ref.deref(),
            });


        } catch (e) {
            log.error(withErrorMessage(e, `borrowProperty ${key}`));
        }

    }

    return true;
}

type BorrowOptions = {
    target?: {},
    refRoot?: boolean,
    retainGetters?: boolean
}

// Utility function for creating WeakRefs
export function borrow<T extends { [key: string]: any }>(source: T, userOptions: BorrowOptions = {}): Borrowed<T> {

    const { target, refRoot, retainGetters } = { target: {}, refRoot: true, retainGetters: false, ...userOptions };

    if (refRoot) {

        const ref = new WeakRef(source);

        for (const key in source) {

            Object.defineProperty(target, key, {
                enumerable: true,
                configurable: false,
                get: () => ref.deref()?.[key]
            });

        }

    } else {

        for (const key in source) {

            const descriptor = getPropertyDescriptor(source, key);

            if (descriptor) {

                borrowProperty(descriptor, source, key, target, retainGetters);

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
export function expose<T, K extends keyof T>(source: T, keys: K[], { asValues }: ExposeOptions = { asValues: false }): Pick<T, K> {

    const result = {} as Pick<T, K>;

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
