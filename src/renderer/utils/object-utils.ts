import { log } from "@ipc/log";
import { DeepPartial } from "common/types";
import { withErrorMessage } from "common/utils/with-error-message";
import { Object3D } from "three";
import deepDiff from "deep-diff";
import set from "lodash.set";
import get from "lodash.get";

// https://zellwk.com/blog/copy-properties-of-one-object-to-another-object/
export function mix(dest: object, ...sources: object[]) {
  for (const source of sources) {
    const props = Object.keys(source);
    for (const prop of props) {
      const descriptor = Object.getOwnPropertyDescriptor(source, prop);
      if (descriptor) {
        Object.defineProperty(dest, prop, descriptor);
      } else {
        log.error(`mix: property ${prop} not found in source`);
      }
    }
  }
  return dest;
}

export type Borrowed<T extends object, TKeepRefs extends boolean = false> = {
  [key in keyof T]: TKeepRefs extends true
    ? T[key] extends object ? WeakRef<T[key]>
    : never
    : T[key] | undefined;
};

function borrowProperty<T extends boolean>(
  descriptor: PropertyDescriptor,
  source: any,
  key: string,
  opts: BorrowOptions<T>,
) {
  if (descriptor.get) {
    // danger zone
    if (opts.retainGetters) {
      try {
        Object.defineProperty(opts.target, key, {
          enumerable: true,
          configurable: false,
          get: () => descriptor.get!() as unknown,
        });

        log.warn(`borrowing getter ${key}`);
      } catch (e) {
        log.error(
          withErrorMessage(
            e,
            `borrow: failed to borrow getter ${key} from source`,
          ),
        );
      }
    } else {
      throw new Error("borrowProperty: getters not supported");
    }
  } else if (descriptor.value !== undefined) {
    try {
      const ref = weak(source[key]);
      const get = opts.retainRefs ? () => ref : () => ref.deref() as unknown;

      Object.defineProperty(opts.target, key, {
        enumerable: true,
        configurable: false,
        get,
      });
    } catch (e) {
      log.error(withErrorMessage(e, `borrowProperty ${key}`));
    }
  }

  return true;
}

interface BorrowOptions<TKeepRefs extends boolean = false> {
  target?: unknown;
  refRoot?: boolean;
  retainGetters?: boolean;
  retainRefs?: TKeepRefs;
  keys?: string[];
}

// Utility function for creating WeakRefs
export function borrow<
  T extends Record<keyof T, object>,
  TKeepRefs extends boolean = false,
>(
  source: T,
  userOptions: BorrowOptions<TKeepRefs> = {},
): Borrowed<T, TKeepRefs> {
  const opts = {
    target: {},
    refRoot: true,
    retainGetters: false,
    retainRefs: false,
    ...userOptions,
  };

  if (opts.refRoot && opts.retainRefs === false) {
    const ref = weak(source);

    for (const key in source) {
      if (opts.keys && !opts.keys.includes(key)) {
        continue;
      }

      Object.defineProperty(opts.target, key, {
        enumerable: true,
        configurable: false,
        get: () => ref.deref()?.[key],
      });
    }
  } else {
    for (const key in source) {
      if (opts.keys && !opts.keys.includes(key)) {
        continue;
      }

      const descriptor = getPropertyDescriptor(source, key);

      if (descriptor) {
        borrowProperty(descriptor, source, key, opts);
      }
    }
  }

  return opts.target as Borrowed<T, TKeepRefs>;
}

export function weak<T extends object>(o: T) {
  return new WeakRef(o);
}

export type Exposed<T extends object, K extends keyof T> = { [key in K]: T[K] };

/*
 * Pick properties from an object and expose them via a new object.
 */
export function expose<T extends object, K extends keyof T>(
  source: WeakRef<T> | T,
  keys: K[],
): Pick<T, K> {
  const result = {} as Pick<T, K>;

  for (const key of keys) {
    if (source instanceof WeakRef) {
      Object.defineProperty(result, key, {
        configurable: false,
        enumerable: true,
        get: () => source.deref()![key],
      });
    } else {
      Object.defineProperty(result, key, {
        configurable: false,
        enumerable: true,
        get: () => source[key],
      });
    }
  }

  return result;
}

// https://stackoverflow.com/questions/60400066/how-to-enumerate-discover-getters-and-setters-in-javascript
const getPropertyDescriptor = (
  source: object | null,
  prop: string,
): null | undefined | PropertyDescriptor => {
  if (source === null) {
    return null;
  }
  const descriptor = Object.getOwnPropertyDescriptor(source, prop);
  if (descriptor == undefined) {
    return getPropertyDescriptor(Object.getPrototypeOf(source) as object, prop);
  }
  return descriptor;
};

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

  if (recursive) {
    for (const child of source.children) {
      this.add(child.clone());
    }
  }

  return this;
};

/**
 * Utility for deepMerge() so that arrays are overwritten instead of merged.
 */
export const arrayOverwriteMerge = (_: any, sourceArray: unknown[]) =>
  sourceArray;

  /**
   * A deeply nested object representing the diff between objects.
   */
export function intersection<T extends object>(prevObject: T, newObject: T) {
  const diffs = deepDiff.diff(prevObject, newObject);
  if (diffs === undefined) return {};

  // update our session with the new user manipulated settings
  // @ts-expect-error
  const result: DeepPartial<T> = {};

  for (const d of diffs) {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (d.kind === "E" && d.path && d.rhs !== undefined) {
      const parentProp = get(newObject, d.path.slice(0, d.path.length - 1));
      // don't diff down to array elements, just the entire array is fine!
      // otherwise we're left with a sparse array :(
      if (
        Array.isArray(parentProp) &&
        typeof d.path[d.path.length - 1] === "number"
      ) {
        set(parentProp, d.path, d.rhs);
        set(result, d.path.slice(0, d.path.length - 1), parentProp);
      } else {
        set(result, d.path, d.rhs);
      }
    }
  }

  return result;
}
