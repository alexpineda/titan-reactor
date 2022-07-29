import ImageHD from "@core/image-hd";
import { Unit } from "@core/unit";
import { Surface } from "@image/canvas";
import selectedUnitsStore from "@stores/selected-units-store";
import { inverse } from "@utils/function-utils";
import Janitor from "@utils/janitor";
import { canOnlySelectOne, canSelectUnit } from "@utils/unit-utils";
import { MouseSelectionBox } from "../input";
import { Camera, Raycaster, Scene, Vector2 } from "three";
import { SelectionBox } from "three/examples/jsm/interactive/SelectionBox";

export const activateUnitSelection = (camera: Camera, scene: Scene, gameSurface: Surface, minimapSurface: Surface) => {
    const janitor = new Janitor;
    const selectionBox = new SelectionBox(camera, scene);

    const visualBox = new MouseSelectionBox();
    visualBox.color = "#007f00";
    janitor.disposable(visualBox);

    let mouseIsDown = false;

    const typeIdSort = (a: Unit, b: Unit) => {
        return a.typeId - b.typeId;
    }

    const _selectDown = (event: PointerEvent) => {
        if (event.button !== 0) return;
        minimapSurface.canvas.style.pointerEvents = "none";
        mouseIsDown = true;
        selectionBox.startPoint.set(
            (event.clientX / window.innerWidth) * 2 - 1,
            - (event.clientY / window.innerHeight) * 2 + 1,
            0.5);

        visualBox.start(event.clientX, event.clientY);
    };
    gameSurface.canvas.addEventListener('pointerdown', _selectDown);
    janitor.callback(() => gameSurface.canvas.removeEventListener('pointerdown', _selectDown));

    // const hoverUnit = throttle((event: PointerEvent) => {
    //     const unit = getUnitFromMouseIntersect(new Vector2((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1));
    //     if (unit) {
    //         mouseCursor.hover();
    //     } else {
    //         mouseCursor.pointer();
    //     }
    // }, 100);

    const _selectMove = (event: PointerEvent) => {

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

    gameSurface.canvas.addEventListener('pointermove', _selectMove);
    janitor.callback(() => gameSurface.canvas.removeEventListener('pointermove', _selectMove));

    const _hasAnyUnit = (unit: Unit) => !unit.extras.dat.isBuilding;

    const _selectRayCaster = new Raycaster();

    const getUnitFromMouseIntersect = (clipV: Vector2) => {
        _selectRayCaster.setFromCamera(clipV, camera);
        // const intersects = _selectRayCaster.intersectObjects(spritesGroup.children, true);
        const intersects = _selectRayCaster.intersectObjects(scene.children, true);
        if (intersects.length) {
            let closestUnit: Unit | undefined;
            let closestRenderOrder = -1;

            for (const intersect of intersects) {
                if (
                    intersect.uv !== undefined &&
                    intersect.object instanceof ImageHD &&
                    intersect.object.userData.unit && canSelectUnit(intersect.object.userData.unit)
                ) {
                    if (
                        intersect.object.renderOrder > closestRenderOrder
                    ) {
                        closestRenderOrder = intersect.object.renderOrder;
                        closestUnit = intersect.object.userData.unit;
                    }
                }
            }

            return closestUnit;
        }
    };

    const _selectUp = (event: PointerEvent) => {
        if (!mouseIsDown) return;

        minimapSurface.canvas.style.pointerEvents = "auto";
        mouseIsDown = false;
        visualBox.clear();
        // mouseCursor.pointer();

        let selectedUnits: Unit[] = [];

        if (!visualBox.isMinDragSize(event.clientX, event.clientY)) {
            const unit = getUnitFromMouseIntersect(new Vector2((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1));
            if (unit) {
                selectedUnits.push(unit);
            } else {
                selectedUnitsStore().clearSelectedUnits();
                return;
            }
        } else {

            selectionBox.endPoint.set(
                (event.clientX / window.innerWidth) * 2 - 1,
                - (event.clientY / window.innerHeight) * 2 + 1,
                0.5);


            const allSelected = selectionBox.select();

            for (let i = 0; i < allSelected.length; i++) {
                if (allSelected[i].userData.unit && canSelectUnit(allSelected[i].userData.unit) && !selectedUnits.includes(allSelected[i].userData.unit)) {
                    selectedUnits.push(allSelected[i].userData.unit);
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
        selectedUnitsStore().setSelectedUnits(selectedUnits);

    }
    gameSurface.canvas.addEventListener('pointerup', _selectUp);
    janitor.callback(() => gameSurface.canvas.removeEventListener('pointerup', _selectUp));

    return () => janitor.mopUp()

}