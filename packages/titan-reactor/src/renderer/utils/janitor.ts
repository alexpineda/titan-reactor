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

        for (const obj of this._objects) {
            disposeObject3D(obj);
            obj.removeFromParent();
        }

        for (const cb of this._callbacks) {
            cb();
        }

        for (const disposable of this._disposable) {
            disposable.dispose();
        }

        this._objects.clear();
        this._disposable.clear();
        this._callbacks.clear();

    }

}
