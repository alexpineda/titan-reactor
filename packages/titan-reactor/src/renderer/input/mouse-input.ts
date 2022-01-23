import { unstable_batchedUpdates } from "react-dom";
import { Group, PerspectiveCamera, Raycaster, Vector2 } from "three";

import { unitTypes } from "../../common/bwdat/enums/unit-types";
import { BwDAT, TerrainInfo } from "../../common/types";
import ProjectedCameraView from "../camera/projected-camera-view";
import { GameCanvasTarget, Layers } from "../render";
import useGameStore from "../stores/game-store";
import { Sprite, CrapUnit, ImageHD } from "../core";
import { tile32 } from "../../common/utils/conversions";
import { MouseSelectionBox } from "./mouse-selection-box";
import { MouseCursor } from "./mouse-cursor";
import Janitor from "../utils/janitor";

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

const setSelectedUnits = useGameStore.getState().setSelectedUnits;
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

interface MouseOffset {
  offsetX: number;
  offsetY: number;
}


export class MouseInput {
  private projectedCameraView?: ProjectedCameraView;
  private _janitor = new Janitor();
  private _interval?: NodeJS.Timeout;

  private _selectionBox = new MouseSelectionBox();
  private _mouseCursor = new MouseCursor();

  private _raycaster = new Raycaster();
  private _mouse = new Vector2();
  private _hover = new Vector2();
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
    unitsGroup: Group,
    projectedCameraView: ProjectedCameraView,
    gameSurface: GameCanvasTarget,
    { terrain, mapWidth, mapHeight }: TerrainInfo,
    camera: PerspectiveCamera,
    unitsBySpriteId: WeakMap<Sprite, CrapUnit>
  ) {
    this.projectedCameraView = projectedCameraView;

    let enableHoverIntersecting = false;

    const intersectMouse = (clipV: Point) => {
      this._raycaster.setFromCamera(clipV, camera);
      const intersects = this._raycaster.intersectObjects(unitsGroup.children);
      if (intersects.length) {
        let closestSprite;

        for (const intersect of intersects) {
          if (
            intersect.uv !== undefined &&
            intersect.object instanceof ImageHD // &&
            // intersect.object?.lastSetFrame &&
            // intersect.object.intersects(
            //   intersect.uv.x,
            //   intersect.uv.y
            // )
          ) {
            if (
              !closestSprite || intersect.object.renderOrder > closestSprite.renderOrder
            ) {
              closestSprite = intersect.object.sprite;
            }
          }
        }

        if (closestSprite instanceof Sprite) {
          return closestSprite;
        }
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
      enableHoverIntersecting = !this._mousedown;

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

      const selected = new Set<CrapUnit>();

      if (isMinDragSize()) {
        const [width, height] = [gameSurface.width, gameSurface.height];
        const startV = new Vector2();
        const endV = new Vector2();
        const l = Math.min(this._start.offsetX, this._end.offsetX);
        const r = Math.max(this._start.offsetX, this._end.offsetX);
        const t = Math.min(this._start.offsetY, this._end.offsetY);
        const b = Math.max(this._start.offsetY, this._end.offsetY);

        startV.x = (l / width) * 2 - 1;
        startV.y = -(t / height) * 2 + 1;
        endV.x = (r / width) * 2 - 1;
        endV.y = -(b / height) * 2 + 1;

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
              for (const unit of unitsBySpriteId.values()) {
                if (tile32(unit.x) === x && tile32(y) === y) {
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

      this._mouse.x = (event.offsetX / gameSurface.width) * 2 - 1;
      this._mouse.y = -(event.offsetY / gameSurface.height) * 2 + 1;

      const sprite = intersectMouse(this._mouse);

      let unit;
      if (sprite) {
        unit = unitsBySpriteId.get(sprite.index);
      }

      //select last sprite on mouse unless we have a bunch of units selected and the last sprite is a resource container or building
      if (
        sprite && unit
      ) {
        const dat = this._bwDat.units[unit.typeId];

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
              this.projectedCameraView.viewBW.left / 32
            );
            const endMapX = Math.floor(
              this.projectedCameraView.viewBW.right / 32
            );
            const startMapY = Math.floor(
              this.projectedCameraView.viewBW.top / 32
            );
            const endMapY = Math.floor(
              this.projectedCameraView.viewBW.bottom / 32
            );

            for (let x = startMapX; x < endMapX; x++) {
              for (let y = startMapY; y < endMapY; y++) {
                for (const unit of unitsBySpriteId.values()) {
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

      let selectedArr = [...selected];
      if (event.shiftKey && useGameStore.getState().selectedUnits.length < 12) {
        selectedArr = [
          ...useGameStore.getState().selectedUnits,
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

      selectedArr.sort((a, b) => {
        return a.typeId - b.typeId;
      }).splice(12);

      unstable_batchedUpdates(() => {
        setSelectedUnits(selectedArr);
      });
    };

    const mouseLeaveListener = () => {
      this._mouseCursor.pointer();
      this._selectionBox.clear();
      this._mousedown = false;
    };

    gameSurface.canvas.addEventListener("pointerdown", mouseDownListener, {
      passive: true,
    });
    this._janitor.callback(() => gameSurface.canvas.removeEventListener("pointerdown", mouseDownListener))

    gameSurface.canvas.addEventListener("pointermove", mouseMoveListener, {
      passive: true,
    });
    this._janitor.callback(() => gameSurface.canvas.removeEventListener("pointermove", mouseMoveListener))


    gameSurface.canvas.addEventListener("pointerup", mouseUpListener, {
      passive: true,
    });
    this._janitor.callback(() => gameSurface.canvas.removeEventListener("pointerup", mouseUpListener)
    )

    gameSurface.canvas.addEventListener("pointerleave", mouseLeaveListener, {
      passive: true,
    });
    this._janitor.callback(() => gameSurface.canvas.removeEventListener(
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
export default MouseInput;
