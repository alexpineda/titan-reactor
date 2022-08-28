import { Object3D } from "three";
import { disposeObject3D } from "./dispose";

interface Disposable {
    dispose: () => void;
}

type EmptyFn = () => void;

type SupportedJanitorTypes = Object3D | Disposable | EmptyFn | NodeJS.EventEmitter;
export default class Janitor {
    #objects = new Set<Object3D>();
    #disposable = new Set<Disposable>();
    #callbacks = new Set<EmptyFn>();

    constructor(dispose?: SupportedJanitorTypes) {
        if (dispose) {
            this.add(dispose);
        }
    }

    addEventListener(element: { addEventListener: Function, removeEventListener: Function }, event: string, callback: Function, options?: AddEventListenerOptions) {
        element.addEventListener(event, callback, options);
        this.add(() => element.removeEventListener(event, callback));
        return this;
    }

    on(nodeEventListener: NodeJS.EventEmitter, event: string, callback: (...args: any[]) => void) {
        nodeEventListener.on(event, callback);
        this.add(() => nodeEventListener.off(event, callback));
    }

    setInterval(callback: EmptyFn, interval: number): NodeJS.Timeout {
        const _i = setInterval(callback, interval);
        this.add(() => clearInterval(_i));
        return _i;
    }

    add<T extends SupportedJanitorTypes>(obj: T): T {
        if (obj instanceof Object3D) {
            this.object3d(obj);
        } else if ("dispose" in obj) {
            this.disposable(obj);
        } else if (typeof obj === "function") {
            this.callback(obj);
        } else {
            throw new Error("Unsupported type");
        }
        return obj;
    }

    callback(callback: EmptyFn) {
        this.#callbacks.add(callback);
    }

    disposable(obj: Disposable) {
        this.#disposable.add(obj);
    }

    object3d(obj: THREE.Object3D) {
        this.#objects.add(obj);
    }

    dispose() {

        if (this.#objects.size) {
            for (const obj of this.#objects) {
                disposeObject3D(obj);
                obj.removeFromParent();
            }
            this.#objects.clear();
        }

        if (this.#callbacks.size) {
            for (const cb of this.#callbacks) {
                cb();
            }
            this.#callbacks.clear();
        }

        if (this.#disposable.size) {
            for (const disposable of this.#disposable) {
                disposable.dispose();
            }

            this.#disposable.clear();
        }

    }

}
