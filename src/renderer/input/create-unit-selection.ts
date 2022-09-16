import { Unit } from "@core/unit";
import { inverse } from "@utils/function-utils";
import Janitor from "@utils/janitor";
import { canOnlySelectOne } from "@utils/unit-utils";
import { VisualSelectionBox } from ".";
import { Camera, Object3D, PerspectiveCamera, Raycaster, Scene, Vector2 } from "three";
import { SelectionBox } from "three/examples/jsm/interactive/SelectionBox";
import { IterableSet } from "@utils/iterable-set";
import { MouseInput } from "./mouse-input";

const typeIdSort = (a: Unit, b: Unit) => {
    return a.typeId - b.typeId;
}
const _hasAnyUnit = (unit: Unit) => !unit.extras.dat.isBuilding;
const _selectRayCaster = new Raycaster();
let _unit: Unit | null;
let _mouse = new Vector2();

export enum UnitSelectionStatus {
    None,
    Dragging,
    Hovering
}

export const createUnitSelectionBox = (mouse: MouseInput, units: IterableSet<Unit>, scene: Scene, onGetUnit: (objects: Object3D) => Unit | null) => {
    const janitor = new Janitor;
    const selectionBox = new SelectionBox(new PerspectiveCamera, scene);
    const visualBox = janitor.mop(new VisualSelectionBox("#00cc00"));

    let _selectActivated = false;
    let _enabled = true;
    let _status = UnitSelectionStatus.None;

    const _selectDown = () => {
        if (mouse.move.z !== 0 || !_enabled) return;
        _selectActivated = true;
        selectionBox.startPoint.set(mouse.move.x, mouse.move.y, 0.5);

        visualBox.start(mouse.clientX, mouse.clientY);
    };

    // const hoverUnit = throttle((event: PointerEvent) => {
    //     const unit = getUnitFromMouseIntersect(_mouse.set((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1));
    //     if (unit) {
    //         mouseCursor.hover();
    //     } else {
    //         mouseCursor.pointer();
    //     }
    // }, 100);

    const _selectMove = () => {
        if (!_enabled) return;

        if (_selectActivated) {

            selectionBox.endPoint.set(mouse.move.x, mouse.move.y, 0.5);

            visualBox.end(mouse.clientX, mouse.clientY);

            _status = UnitSelectionStatus.Dragging;

        } else {
            // hoverUnit(event)
        }

    }

    const getUnitFromMouseIntersect = (clipV: Vector2) => {
        _selectRayCaster.setFromCamera(clipV, selectionBox.camera);
        // const intersects = _selectRayCaster.intersectObjects(spritesGroup.children, true);
        const intersects = _selectRayCaster.intersectObjects(selectionBox.scene.children, true);
        if (intersects.length) {
            let closestUnit: Unit | undefined;
            let closestRenderOrder = -1;

            for (const intersect of intersects) {
                _unit = onGetUnit(intersect.object);
                if (
                    _unit
                ) {
                    if (
                        intersect.object.renderOrder > closestRenderOrder
                    ) {
                        closestRenderOrder = intersect.object.renderOrder;
                        closestUnit = _unit;
                    }
                }
            }

            return closestUnit;
        }
    };

    const _selectUp = () => {
        if (!_selectActivated || !_enabled) return;

        _selectActivated = false;
        visualBox.clear();
        _status = UnitSelectionStatus.None;

        let draft: Unit[] = [];

        if (!visualBox.isMinDragSize(mouse.clientX, mouse.clientY)) {
            const unit = getUnitFromMouseIntersect(_mouse.set(mouse.move.x, mouse.move.y));
            if (unit) {
                draft.push(unit);
            } else {
                units.clear();
                return;
            }
        } else {

            selectionBox.endPoint.set(mouse.move.x, mouse.move.y, 0.5);

            const allSelected = selectionBox.select();
            for (let i = 0; i < allSelected.length; i++) {
                _unit = onGetUnit(allSelected[i]);
                if (_unit && !draft.includes(_unit)) {
                    draft.push(_unit);
                }
            }

            const onlyUnits = draft.filter(_hasAnyUnit);
            if (onlyUnits.length > 0 && onlyUnits.length !== draft.length) {
                draft = onlyUnits;
            }

            // since egg has no cmd icon, dont allow multi select unless they are all the same in which case just select one
            if (
                draft.length > 1 &&
                draft.some(canOnlySelectOne)
            ) {
                if (
                    draft.every((unit) => unit.typeId === draft[0].typeId)
                ) {
                    draft = draft.slice(-1);
                } else {
                    draft = draft.filter(inverse(canOnlySelectOne));
                }
            }
        }

        draft.sort(typeIdSort).splice(12);

        units.set(draft);

    }

    return {
        get status() {
            return _status;
        },
        set camera(camera: Camera) {
            selectionBox.camera = camera;
        },
        set enabled(value: boolean) {
            visualBox.enabled = value;
            _enabled = value;
            _selectActivated = value && _selectActivated;
        },
        get enabled() {
            return _enabled;
        },
        get isActive() {
            return _selectActivated;
        },
        update() {
            if (mouse.clicked) {
                _selectDown();
            } else if (mouse.released) {
                _selectUp();
            } else {
                _selectMove();
            }
        }
    }

}