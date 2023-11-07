import { arrayOverwriteMerge, intersection } from "@utils/object-utils";
import { DeepPartial } from "common/types";
import get from "lodash.get";
import deepMerge from "deepmerge";

const structuredClone =
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    globalThis.structuredClone ||
    ( ( x: object ) => JSON.parse( JSON.stringify( x ) ) as unknown );

/**
 * An object that emits the diff when it is updated.
 */
export class SourceOfTruth<T extends object> {
    #data: T;
    onUpdate: ( ( diff: DeepPartial<T> ) => void ) | undefined;

    constructor( data: T ) {
        this.#data = data;
    }

    getValue( path: string[] ): any {
        return get( this.#data, path );
    }

    update( data: Partial<T> ) {
        const result = intersection( this.#data, data ) as DeepPartial<T>;
        this.#data = deepMerge( this.#data, result, {
            arrayMerge: arrayOverwriteMerge,
        } ) as Required<T>;
        this.onUpdate && this.onUpdate( result );
    }

    clone() {
        return structuredClone( this.#data );
    }
}
