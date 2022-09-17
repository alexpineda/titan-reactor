import * as log from "@ipc/log";
import { withErrorMessage } from "common/utils/with-error-message";
import { Object3D } from "three";
import { disposeObject3D } from "./dispose";

function isIterable(obj: any): obj is Iterable<any> {
    // checks for null and undefined
    if (obj == null) {
        return false;
    }
    return typeof obj[Symbol.iterator] === 'function';
}
interface Disposable {
    dispose: () => void;
}

type EmptyFn = () => void;

type SupportedJanitorTypes = Object3D | Disposable | EmptyFn | NodeJS.EventEmitter | HTMLElement;
type ExtendedJanitorTypes = SupportedJanitorTypes | Iterable<SupportedJanitorTypes>;
export default class Janitor {
    #trackables = new Set<ExtendedJanitorTypes>();
    #keepTrackablesAfterDispose: boolean;

    constructor(keepTrackablesAfterDispose = false) {
        this.#keepTrackablesAfterDispose = keepTrackablesAfterDispose;
    }

    addEventListener(element: { addEventListener: Function, removeEventListener: Function }, event: string, callback: Function, options?: AddEventListenerOptions) {
        element.addEventListener(event, callback, options);
        this.mop(() => element.removeEventListener(event, callback));
        return this;
    }

    on(nodeEventListener: { on: Function, off: Function }, event: string, callback: (...args: any[]) => void) {
        nodeEventListener.on(event, callback);
        this.mop(() => nodeEventListener.off(event, callback));
    }

    setInterval(callback: EmptyFn, interval: number): NodeJS.Timeout {
        const _i = setInterval(callback, interval);
        this.mop(() => clearInterval(_i));
        return _i;
    }

    mop<T extends ExtendedJanitorTypes>(...obj: T[]): T {
        for (const o of obj) {
            this.#trackables.add(o);
        }
        return obj[0];
    }

    #disposeAny(obj: ExtendedJanitorTypes) {
        try {
            if (obj instanceof Object3D) {
                disposeObject3D(obj);
                obj.removeFromParent();
            } else if ("dispose" in obj) {
                obj.dispose()
            } else if (typeof obj === "function") {
                obj();
            } else if ("remove" in obj) {
                obj.remove();
            } else if (isIterable(obj)) {
                for (const o of obj) {
                    this.#disposeAny(o);
                }
            } else {
                console.warn("Unsupported type", obj);
            }
        } catch (e) {
            log.error(withErrorMessage(e, "Error disposing object"));
        }
    }

    dispose(...objects: ExtendedJanitorTypes[]) {
        if (objects.length === 0) {
            if (this.#trackables) {
                for (const obj of this.#trackables) {
                    this.#disposeAny(obj);
                }
            }
            if (!this.#keepTrackablesAfterDispose) {
                this.#trackables.clear();
            }
        } else {
            for (const object of objects) {
                this.#disposeAny(object);
            }
            return;
        }

    }

}
