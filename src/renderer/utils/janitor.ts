import { Object3D } from "three";
import { disposeObject3D } from "./dispose";

interface Disposable {
    dispose: () => void;
}

type EmptyFn = () => void;

export default class Janitor {
    private _objects = new Set<Object3D>();
    private _disposable = new Set<Disposable>();
    private _callbacks = new Set<EmptyFn>();

    callback(callback: EmptyFn) {
        this._callbacks.add(callback);
    }

    disposable(obj: Disposable) {
        this._disposable.add(obj);
    }

    object3d(obj: THREE.Object3D) {
        this._objects.add(obj);
    }

    mopUp() {

        if (this._objects.size) {
            for (const obj of this._objects) {
                disposeObject3D(obj);
                obj.removeFromParent();
            }
            this._objects.clear();
        }

        if (this._callbacks.size) {
            for (const cb of this._callbacks) {
                cb();
            }
            this._callbacks.clear();
        }

        if (this._disposable.size) {
            for (const disposable of this._disposable) {
                disposable.dispose();
            }

            this._disposable.clear();
        }

    }

}
