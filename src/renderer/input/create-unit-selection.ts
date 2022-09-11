import { Unit } from "@core/unit";
import { Surface } from "@image/canvas";
import selectedUnitsStore from "@stores/selected-units-store";
import { inverse } from "@utils/function-utils";
import Janitor from "@utils/janitor";
import { canOnlySelectOne } from "@utils/unit-utils";
import { MouseSelectionBox } from ".";
import { Object3D, PerspectiveCamera, Raycaster, Scene, Vector2 } from "three";
import { SelectionBox } from "three/examples/jsm/interactive/SelectionBox";
import shallow from "zustand/shallow";

const typeIdSort = (a: Unit, b: Unit) => {
    return a.typeId - b.typeId;
}
const _hasAnyUnit = (unit: Unit) => !unit.extras.dat.isBuilding;
const _selectRayCaster = new Raycaster();
let _unit: Unit | null;
let _mouse = new Vector2();


export const createUnitSelection = (scene: Scene, gameSurface: Surface, minimapSurface: Surface, onGetUnit: (objects: Object3D) => Unit | null) => {
    const janitor = new Janitor;
    const selectionBox = new SelectionBox(new PerspectiveCamera, scene);
    const visualBox = janitor.mop(new MouseSelectionBox("#00cc00"));

    let mouseIsDown = false;
    let enabled = true;
    let onSelectedUnitsChange: (units: Unit[]) => void = () => { };

    const _selectDown = (event: PointerEvent) => {
        if (event.button !== 0 || !enabled) return;
        minimapSurface.canvas.style.pointerEvents = "none";
        mouseIsDown = true;
        selectionBox.startPoint.set(
            (event.clientX / window.innerWidth) * 2 - 1,
            - (event.clientY / window.innerHeight) * 2 + 1,
            0.5);

        visualBox.start(event.clientX, event.clientY);
    };

    // const hoverUnit = throttle((event: PointerEvent) => {
    //     const unit = getUnitFromMouseIntersect(_mouse.set((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1));
    //     if (unit) {
    //         mouseCursor.hover();
    //     } else {
    //         mouseCursor.pointer();
    //     }
    // }, 100);

    const _selectMove = (event: PointerEvent) => {
        if (!enabled) return;

        if (mouseIsDown) {

            selectionBox.endPoint.set(
                (event.clientX / window.innerWidth) * 2 - 1,
                - (event.clientY / window.innerHeight) * 2 + 1,
                0.5);

            visualBox.end(event.clientX, event.clientY);
            // mouseCursor.drag();
        } else {
            // hoverUnit(event)
        }

    }

    const getUnitFromMouseIntersect = (clipV: Vector2) => {
        _selectRayCaster.setFromCamera(clipV, selectionBox.camera);
        // const intersects = _selectRayCaster.intersectObjects(spritesGroup.children, true);
        const intersects = _selectRayCaster.intersectObjects(scene.children, true);
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

    const _selectUp = (event: PointerEvent) => {
        if (!mouseIsDown || !enabled) return;

        minimapSurface.canvas.style.pointerEvents = "auto";
        mouseIsDown = false;
        visualBox.clear();
        // mouseCursor.pointer();

        let selectedUnits: Unit[] = [];

        if (!visualBox.isMinDragSize(event.clientX, event.clientY)) {
            const unit = getUnitFromMouseIntersect(_mouse.set((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1));
            if (unit) {
                selectedUnits.push(unit);
            } else {
                selectedUnitsStore().clearSelectedUnits();
                onSelectedUnitsChange([]);
                return;
            }
        } else {

            selectionBox.endPoint.set(
                (event.clientX / window.innerWidth) * 2 - 1,
                - (event.clientY / window.innerHeight) * 2 + 1,
                0.5);

            const allSelected = selectionBox.select();
            for (let i = 0; i < allSelected.length; i++) {
                _unit = onGetUnit(allSelected[i]);
                if (_unit && !selectedUnits.includes(_unit)) {
                    selectedUnits.push(_unit);
                }
            }

            if (event.shiftKey) {
                for (const unit of selectedUnitsStore().selectedUnits) {
                    if (!selectedUnits.includes(unit)) {
                        selectedUnits.push(unit);
                    }
                }
            }

            const onlyUnits = selectedUnits.filter(_hasAnyUnit);
            if (onlyUnits.length > 0 && onlyUnits.length !== selectedUnits.length) {
                selectedUnits = onlyUnits;
            }

            // since egg has no cmd icon, dont allow multi select unless they are all the same in which case just select one
            if (
                selectedUnits.length > 1 &&
                selectedUnits.some(canOnlySelectOne)
            ) {
                if (
                    selectedUnits.every((unit) => unit.typeId === selectedUnits[0].typeId)
                ) {
                    selectedUnits = selectedUnits.slice(-1);
                } else {
                    selectedUnits = selectedUnits.filter(inverse(canOnlySelectOne));
                }
            }
        }

        selectedUnits.sort(typeIdSort).splice(12);

        if (shallow(selectedUnitsStore().selectedUnits, selectedUnits) === false) {
            selectedUnitsStore().setSelectedUnits(selectedUnits);
            onSelectedUnitsChange(selectedUnits);
        }

    }

    janitor.addEventListener(gameSurface.canvas, 'pointerup', _selectUp);
    janitor.addEventListener(gameSurface.canvas, "pointerdown", _selectDown);
    janitor.addEventListener(gameSurface.canvas, 'pointermove', _selectMove);

    return {
        dispose: () => janitor.dispose(),
        selectionBox,
        get enabled() {
            return enabled;
        },
        set enabled(value: boolean) {
            visualBox.enabled = value;
            enabled = value;
        },
        set onSelectedUnitsChange(value: (units: Unit[]) => void) {
            onSelectedUnitsChange = value;
        }
    }

}