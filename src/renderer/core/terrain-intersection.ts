import { Camera, Intersection, Object3D, Raycaster } from "three";
const _rayCaster = new Raycaster();
const _intersections: Intersection[] = [];

export const rayIntersectObject = (
    object: Object3D,
    recursive: boolean,
    camera: Camera,
    mouse: { x: number; y: number }
): Intersection[] => {
    _intersections.length = 0;
    // @ts-expect-error
    _rayCaster.setFromCamera( mouse, camera );
    _rayCaster.intersectObject( object, recursive, _intersections );
    return _intersections;
};
