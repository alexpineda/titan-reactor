import { Group, Object3D, PerspectiveCamera, Raycaster, Vector2 } from "three";

import { unitTypes } from "common/enums";
import { BwDAT, TerrainInfo } from "common/types";
import { tile32 } from "common/utils/conversions";

import Janitor from "@utils/janitor";

import ProjectedCameraView from "../camera/projected-camera-view";
import { Layers } from "../render";
import { MouseSelectionBox } from "./mouse-selection-box";
import { MouseCursor } from "./mouse-cursor";
import { useSelectedUnitsStore } from "@stores/selected-units-store";
import { ImageHD, Unit } from "@core";

const canOnlySelectOne = [
    unitTypes.larva,
    unitTypes.zergEgg,
    unitTypes.geyser,
    unitTypes.mineral1,
    unitTypes.mineral2,
    unitTypes.mineral3,
    unitTypes.mutaliskCocoon,
    unitTypes.lurkerEgg,
];

const typeIdSort = (a: Unit, b: Unit) => {
    return a.typeId - b.typeId;
}

type Point = { x: number; y: number };
type Rect = {
    left: number;
    right: number;
    top: number;
    bottom: number;
};
function intersectRect(r1: Rect, r2: Rect) {
    return !(
        r2.left > r1.right ||
        r2.right < r1.left ||
        r2.top > r1.bottom ||
        r2.bottom < r1.top
    );
}

const viewBW = {
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
}

export class MouseUnitSelector {
    private projectedCameraView?: ProjectedCameraView;
    private _janitor = new Janitor();
    private _interval?: NodeJS.Timeout;

    private _selectionBox = new MouseSelectionBox();
    private _mouseCursor = new MouseCursor();

    private _raycaster = new Raycaster();
    private _mouse = new Vector2();
    // private _hover = new Vector2();
    private _bwDat: BwDAT;
    private _start = { offsetX: 0, offsetY: 0 };
    private _end = { offsetX: 0, offsetY: 0 };
    private _mousedown = false;

    constructor(bwDat: BwDAT) {
        this._janitor.disposable(this._selectionBox);
        this._janitor.disposable(this._mouseCursor);

        this._mouseCursor.pointer();
        this._raycaster.layers.set(Layers.Clickable);

        this._bwDat = bwDat;
    }


    bind(
        images: Group,
        projectedCameraView: ProjectedCameraView,
        { terrain, mapWidth, mapHeight }: TerrainInfo,
        camera: PerspectiveCamera,
        unitsMap: Map<number, Unit>
    ) {
        this.projectedCameraView = projectedCameraView;


        // let enableHoverIntersecting = false;

        const getUnitFromMouseIntersect = (clipV: Point) => {
            this._raycaster.setFromCamera(clipV, camera);
            const intersects = this._raycaster.intersectObjects(images.children);
            if (intersects.length) {
                let closestUnit: Unit | undefined;
                let closestRenderOrder = 0;

                for (const intersect of intersects) {
                    if (
                        intersect.uv !== undefined &&
                        intersect.object instanceof Object3D &&
                        intersect.object.userData.unit
                    ) {
                        if (intersect.object instanceof ImageHD && intersect.object.intersects(
                            intersect.uv.x,
                            intersect.uv.y
                        )) {
                            if (
                                !closestUnit || intersect.object.renderOrder > closestRenderOrder
                            ) {
                                closestRenderOrder = intersect.object.renderOrder;
                                closestUnit = intersect.object.userData.unit;
                            }
                        }
                    }
                }

                return closestUnit;
            }
        };

        const isMinDragSize = () =>
            Math.abs(this._end.offsetX - this._start.offsetX) > 10 &&
            Math.abs(this._end.offsetY - this._start.offsetY) > 10;

        const mouseDownListener = (event: MouseEvent) => {
            if (event.button !== 0) return;

            this._start = event;

            this._end = {
                offsetX: this._start.offsetX + 1,
                offsetY: this._start.offsetY + 1,
            };

            this._mousedown = true;
        };

        const mouseMoveListener = (event: MouseEvent) => {
            // enableHoverIntersecting = !this._mousedown;

            if (this._mousedown && isMinDragSize()) {
                this._mouseCursor.drag();
                this._selectionBox.update(this._start.offsetX, this._start.offsetY, this._end.offsetX, this._end.offsetY);
            }
            this._end = event;
        };

        const mouseUpListener = (event: MouseEvent) => {
            this._mouseCursor.pointer();
            this._selectionBox.clear();

            if (!this._mousedown) return;
            this._mousedown = false;

            const selected = new Set<Unit>();

            if (isMinDragSize()) {
                const startV = new Vector2();
                const endV = new Vector2();
                const l = Math.min(this._start.offsetX, this._end.offsetX);
                const r = Math.max(this._start.offsetX, this._end.offsetX);
                const t = Math.min(this._start.offsetY, this._end.offsetY);
                const b = Math.max(this._start.offsetY, this._end.offsetY);

                startV.x = (l / window.innerWidth) * 2 - 1;
                startV.y = -(t / window.innerHeight) * 2 + 1;
                endV.x = (r / window.innerWidth) * 2 - 1;
                endV.y = -(b / window.innerHeight) * 2 + 1;

                this._raycaster.setFromCamera(startV, camera);
                const startIntersects = this._raycaster.intersectObject(terrain, true);

                this._raycaster.setFromCamera(endV, camera);
                const endIntersects = this._raycaster.intersectObject(terrain, true);

                if (startIntersects.length && endIntersects.length) {
                    const { point } = startIntersects[0];
                    const { point: point2 } = endIntersects[0];
                    const startMapX = Math.floor(point.x + mapWidth / 2);
                    const startMapY = Math.floor(point.z + mapHeight / 2);
                    const endMapX = Math.floor(point2.x + mapWidth / 2);
                    const endMapY = Math.floor(point2.z + mapHeight / 2);

                    const r1 = {
                        left: startMapX * 32,
                        top: startMapY * 32,
                        right: endMapX * 32,
                        bottom: endMapY * 32,
                    };

                    const r2 = { left: 0, right: 0, top: 0, bottom: 0 };

                    const candidates = [];

                    //@todo add special logic for flying units since their y object position is offset in threejs
                    for (let x = startMapX - 1; x < endMapX + 1; x++) {
                        for (let y = startMapY - 1; y < endMapY + 1; y++) {
                            //@todo change access method to be more efficient
                            for (const unit of unitsMap.values()) {
                                if (tile32(unit.x) === x && tile32(unit.y) === y) {
                                    // test one tile out of selection bounds since unit tileX/Y is centered
                                    // use placement approximations from UnitsDat for these "slightly out of bounds" units
                                    const dat = this._bwDat.units[unit.typeId];

                                    if (
                                        x === startMapX - 1 ||
                                        x === endMapX + 1 ||
                                        y === startMapY - 1 ||
                                        y === endMapY + 1
                                    ) {

                                        r2.left = unit.x - dat.unitSizeLeft;
                                        r2.right = unit.x + dat.unitSizeRight;
                                        r2.top = unit.y - dat.unitSizeUp;
                                        r2.bottom = unit.y + dat.unitSizeDown;
                                        if (intersectRect(r1, r2)) {
                                            candidates.push(unit);
                                            if (!dat.isBuilding) {
                                                selected.add(unit);
                                            }
                                        }
                                    } else {
                                        candidates.push(unit);
                                        if (!dat.isBuilding) {
                                            selected.add(unit);
                                        }
                                    }
                                }
                            }
                        }
                    }

                    // select any valid buildings if no units were selected
                    if (!selected.size && candidates.length) {
                        candidates.forEach((building) => selected.add(building));
                    }
                }
            }

            this._mouse.x = (event.offsetX / window.innerWidth) * 2 - 1;
            this._mouse.y = -(event.offsetY / window.innerHeight) * 2 + 1;

            const unit = getUnitFromMouseIntersect(this._mouse);

            //select last sprite on mouse unless we have a bunch of units selected and the last sprite is a resource container or building
            if (
                unit
            ) {
                const dat = this._bwDat.units[unit.typeId];

                viewBW.left = (projectedCameraView.left + mapWidth / 2);
                viewBW.top = (projectedCameraView.top + mapHeight / 2);
                viewBW.right = (projectedCameraView.right + mapWidth / 2);
                viewBW.bottom = (projectedCameraView.bottom + mapHeight / 2);

                if (!(
                    selected.size &&
                    (dat.isResourceContainer ||
                        dat.isBuilding)
                )) {
                    // ctrl modifier -> select all of unit type in view
                    if (
                        event.ctrlKey &&
                        this.projectedCameraView instanceof ProjectedCameraView
                    ) {
                        const startMapX = Math.floor(
                            viewBW.left
                        );
                        const endMapX = Math.floor(
                            viewBW.right
                        );
                        const startMapY = Math.floor(
                            viewBW.top
                        );
                        const endMapY = Math.floor(
                            viewBW.bottom
                        );

                        for (let x = startMapX; x < endMapX; x++) {
                            for (let y = startMapY; y < endMapY; y++) {
                                for (const unit of unitsMap.values()) {
                                    if (
                                        tile32(unit.x) === x &&
                                        tile32(unit.y) === y &&
                                        unit.typeId === dat.index
                                    ) {
                                        // test one tile out of selection bounds since unit tileX/Y is centered
                                        // use placement approximations from UnitsDat for these "slightly out of bounds" units
                                        selected.add(unit);
                                    }
                                }
                            }
                        }
                    }
                    // otherwise do the final select
                    else {
                        selected.add(unit);
                    }
                }
            }
            const state = useSelectedUnitsStore.getState();

            if (selected.size === 0 && state.selectedUnits.length === 0) {
                return;
            }

            let selectedArr = [...selected];

            if (event.shiftKey && state.selectedUnits.length < 12) {
                selectedArr = [
                    ...state.selectedUnits,
                    ...selectedArr,
                ];
            }

            // since egg has no cmd icon, dont allow multi select unless they are all the same in which case just select one
            if (
                selectedArr.length > 1 &&
                selectedArr.some((unit) => canOnlySelectOne.includes(unit.typeId))
            ) {
                if (
                    selectedArr.every((unit) => unit.typeId === selectedArr[0].typeId)
                ) {
                    selectedArr = selectedArr.slice(-1);
                } else {
                    selectedArr = selectedArr.filter(
                        (unit) => !canOnlySelectOne.includes(unit.typeId)
                    );
                }
            }

            selectedArr.sort(typeIdSort).splice(12);

            state.setSelectedUnits(selectedArr);

        };

        const mouseLeaveListener = () => {
            this._mouseCursor.pointer();
            this._selectionBox.clear();
            this._mousedown = false;
        };

        document.body.addEventListener("pointerdown", mouseDownListener, {
            capture: false,
            passive: true,
        });
        this._janitor.callback(() => document.body.removeEventListener("pointerdown", mouseDownListener))

        document.body.addEventListener("pointermove", mouseMoveListener, {
            capture: false,
            passive: true,
        });
        this._janitor.callback(() => document.body.removeEventListener("pointermove", mouseMoveListener))


        document.body.addEventListener("pointerup", mouseUpListener, {
            capture: false,
            passive: true,
        });
        this._janitor.callback(() => document.body.removeEventListener("pointerup", mouseUpListener)
        )

        document.body.addEventListener("pointerleave", mouseLeaveListener, {
            capture: false,
            passive: true,
        });
        this._janitor.callback(() => document.body.removeEventListener(
            "pointerleave",
            mouseLeaveListener
        ))

    }

    dispose() {
        if (this._interval) {
            clearInterval(this._interval);
        }
        this._janitor.mopUp();
    }
}
export default MouseUnitSelector;