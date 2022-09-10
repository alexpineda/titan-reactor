
import { Camera, Intersection, Object3D, Raycaster, Vector2 } from "three";
const _rayCaster = new Raycaster();
const _intersections: Intersection[] = [];

export class RaycastHelper {

    static intersectObject(object: Object3D, recursive: boolean, camera: Camera, mouse: Vector2): Intersection[] {
        _intersections.length = 0;
        _rayCaster.setFromCamera(mouse, camera);
        _rayCaster.intersectObject(object, recursive, _intersections);
        return _intersections;
    }

}