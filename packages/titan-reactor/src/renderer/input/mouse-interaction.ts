// @ts-nocheck
import { unstable_batchedUpdates } from "react-dom";
import { PerspectiveCamera, Raycaster, Vector2 } from "three";

import { unitTypes } from "../../common/bwdat/enums/unit-types";
import { TerrainInfo } from "../../common/types";
import ProjectedCameraView from "../camera/projected-camera-view";
import GameCanvasTarget from "../render/game-canvas-target";
import useGameStore, { getAssets } from "../stores/game-store";
import { Image, Sprite, CrapUnit } from "../core";
import assert from "assert";
import { tile32 } from "../../common/utils/conversions";

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

type Icons = string[];

/**
 * Manages drawing the cursor (currently css :( ) as well as unit selection logic
 */
export class MouseInteraction {
  selectElement: HTMLSpanElement;

  private projectedCameraView?: ProjectedCameraView;

  private _lastClass = "";

  private arrowIcons: Icons;
  private dragIcons: Icons;
  private hoverIcons: Icons;
  private _pointer: Icons;
  private arrowIconsIndex = 0;
  private hoverIconsIndex = 0;
  private dragIconsIndex = 0;
  private _dispose?: () => void;
  private _interval?: NodeJS.Timeout;

  constructor() {
    const icons = getAssets();
    assert(icons);
    
    this.arrowIcons = icons.arrowIcons;
    this.hoverIcons = icons.hoverIcons.icons;
    this.dragIcons = icons.dragIcons.icons;

    this._pointer = this.arrowIcons;

    // this._interval = setInterval(() => {
    //   this.arrowIconsIndex =
    //     (this.arrowIconsIndex + 1) % this.arrowIcons.length;
    //   this.hoverIconsIndex =
    //     (this.hoverIconsIndex + 1) % this.hoverIcons.length;
    //   this.dragIconsIndex = (this.dragIconsIndex + 1) % this.dragIcons.length;
    //   this._updateIcon();
    // }, 250);

    const style = document.createElement("style");
    style.id = "cursor-styles";
    document.head.appendChild(style);
    style.appendChild(
      document.createTextNode(`
      ${this.arrowIcons
          .map(
            (icon, i: number) => `
          .cursor-pointer-${i} {
            cursor: url(${icon}), auto
          }
        `
          )
          .join("\n")}
        
      ${this.hoverIcons
          .map(
            (icon, i: number) => `
          .cursor-hover-${i} {
            cursor: url(${icon}), auto
          }
        `
          )
          .join("\n")}

      ${this.dragIcons
          .map(
            (icon, i: number) => `
          .cursor-drag-${i} {
            cursor: url(${icon}), auto
          }
        `
          )
          .join("\n")}
  `)
    );

    this.selectElement = document.createElement("span");
    this.selectElement.style.outline = "3px solid #00ff007f";
    this.selectElement.style.position = "absolute";
    this.selectElement.style.display = "none";
    this.selectElement.style.pointerEvents = "none";
    document.body.appendChild(this.selectElement);
  }

  _updateClasses(index: number, type = "pointer") {
    if (!window.document.body.classList.contains(this._lastClass)) {
      window.document.body.classList.add(`cursor-${type}-${index}`);
    } else {
      window.document.body.classList.replace(
        this._lastClass,
        `cursor-${type}-${index}`
      );
    }
    this._lastClass = `cursor-${type}-${index}`;
  }

  _updateIcon() {
    if (this._pointer === this.arrowIcons) {
      this._updateClasses(this.arrowIconsIndex, "pointer");
    } else if (this._pointer === this.hoverIcons) {
      this._updateClasses(this.hoverIconsIndex, "hover");
    } else if (this._pointer === this.dragIcons) {
      this._updateClasses(this.dragIconsIndex, "drag");
    }
  }

  pointer() {
    this._pointer = this.arrowIcons;
    this._updateIcon();
  }

  hover() {
    this._pointer = this.hoverIcons;
  }

  drag() {
    this._pointer = this.dragIcons;
  }

  init(
    projectedCameraView: ProjectedCameraView,
    gameSurface: GameCanvasTarget,
    { terrain, mapWidth, mapHeight }: TerrainInfo,
    camera: PerspectiveCamera,
    unitsBySpriteId: Map<number, CrapUnit>
  ) {
    this.projectedCameraView = projectedCameraView;

    const raycaster = new Raycaster();
    const mouse = new Vector2();
    const hover = new Vector2();

    let start = { offsetX: 0, offsetY: 0 };
    let end = { offsetX: 0, offsetY: 0 };
    let mousedown = false;
    let enableHoverIntersecting = false;

    const intersectMouse = (clipV: Point) => {
      raycaster.setFromCamera(clipV, camera);
      // calculate objects intersecting the picking ray
      const intersects = raycaster.intersectObjects([], false);
      if (intersects.length) {
        let closestSprite = { renderOrder: -1 };

        // @todo, ImageHD no longer has sprite object attached, how do we access this info?
        // for (const intersect of intersects) {
        //   if (
        //     intersect.object.sprite?.unit?.canSelect &&
        //     intersect.object.sprite.mainImage?.lastSetFrame &&
        //     intersect.object.sprite.mainImage.intersects(
        //       intersect.uv.x,
        //       intersect.uv.y
        //     )
        //   ) {
        //     if (
        //       intersect.object.sprite.renderOrder > closestSprite.renderOrder
        //     ) {
        //       closestSprite = intersect.object.sprite;
        //     }
        //   }
        // }

        if (closestSprite instanceof Sprite) {
          return closestSprite;
        }
      }
    };

    const isMinDragSize = () =>
      Math.abs(end.offsetX - start.offsetX) > 10 &&
      Math.abs(end.offsetY - start.offsetY) > 10;

    const updateDragElement = () => {
      const l = Math.min(start.offsetX, end.offsetX);
      const r = Math.max(start.offsetX, end.offsetX);
      const t = Math.min(start.offsetY, end.offsetY);
      const b = Math.max(start.offsetY, end.offsetY);

      this.selectElement.style.left = `${l}px`;
      this.selectElement.style.top = `${t}px`;
      this.selectElement.style.width = `${r - l}px`;
      this.selectElement.style.height = `${b - t}px`;
    };

    const initDragElement = () => {
      this.selectElement.style.display = "block";
      updateDragElement();
    };

    const clearDragElement = () => {
      this.selectElement.style.display = "none";
    };

    const mouseDownListener = (event: MouseEvent) => {
      if (event.button !== 0) return;

      start = event;

      end = {
        offsetX: start.offsetX + 1,
        offsetY: start.offsetY + 1,
      };

      mousedown = true;
    };

    const mouseMoveListener = (event: MouseEvent) => {
      enableHoverIntersecting = !mousedown;

      if (mousedown && isMinDragSize()) {
        this.drag();
        initDragElement();
        updateDragElement();
      }
      end = event;
    };

    const mouseUpListener = (event: MouseEvent) => {
      this.pointer();
      clearDragElement();

      if (!mousedown) return;
      mousedown = false;

      const selected = new Set<CrapUnit>();

      if (isMinDragSize()) {
        const [width, height] = [gameSurface.width, gameSurface.height];
        const startV = new Vector2();
        const endV = new Vector2();
        const l = Math.min(start.offsetX, end.offsetX);
        const r = Math.max(start.offsetX, end.offsetX);
        const t = Math.min(start.offsetY, end.offsetY);
        const b = Math.max(start.offsetY, end.offsetY);

        startV.x = (l / width) * 2 - 1;
        startV.y = -(t / height) * 2 + 1;
        endV.x = (r / width) * 2 - 1;
        endV.y = -(b / height) * 2 + 1;

        raycaster.setFromCamera(startV, camera);
        const startIntersects = raycaster.intersectObject(terrain, true);

        raycaster.setFromCamera(endV, camera);
        const endIntersects = raycaster.intersectObject(terrain, true);

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
                if (unit.canSelect && tile32(unit.x) === x && tile32(y) === y) {
                  // test one tile out of selection bounds since unit tileX/Y is centered
                  // use placement approximations from UnitsDat for these "slightly out of bounds" units
                  if (
                    x === startMapX - 1 ||
                    x === endMapX + 1 ||
                    y === startMapY - 1 ||
                    y === endMapY + 1
                  ) {
                    r2.left = unit.x - unit.dat.unitSizeLeft;
                    r2.right = unit.x + unit.dat.unitSizeRight;
                    r2.top = unit.y - unit.dat.unitSizeUp;
                    r2.bottom = unit.y + unit.dat.unitSizeDown;
                    if (intersectRect(r1, r2)) {
                      candidates.push(unit);
                      if (!unit.dat.isBuilding) {
                        selected.add(unit);
                      }
                    }
                  } else {
                    candidates.push(unit);
                    if (!unit.dat.isBuilding) {
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

      mouse.x = (event.offsetX / gameSurface.width) * 2 - 1;
      mouse.y = -(event.offsetY / gameSurface.height) * 2 + 1;

      const sprite = intersectMouse(mouse);
      //select last sprite on mouse unless we have a bunch of units selected and the last sprite is a resource container or building
      if (
        sprite &&
        sprite.unit?.canSelect &&
        !(
          selected.size &&
          (sprite.unit?.dat.isResourceContainer ||
            sprite.unit?.dat.isBuilding)
        )
      ) {
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
                  unit.canSelect &&
                  tile32(unit.x) === x &&
                  tile32(unit.y) === y &&
                  unit.dat === sprite.unit?.dat
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
          selected.add(sprite.unit);
        }
      }

      let selectedFinal = [...selected];
      if (event.shiftKey && useGameStore.getState().selectedUnits.length < 12) {
        selectedFinal = [
          ...useGameStore.getState().selectedUnits,
          ...selectedFinal,
        ];
      }

      // since egg has no cmd icon, dont allow multi select unless they are all the same in which case just select one
      if (
        selectedFinal.length > 1 &&
        selectedFinal.some((unit) => canOnlySelectOne.includes(unit.typeId))
      ) {
        if (
          selectedFinal.every((unit) => unit.typeId === selectedFinal[0].typeId)
        ) {
          selectedFinal = selectedFinal.slice(-1);
        } else {
          selectedFinal = selectedFinal.filter(
            (unit) => !canOnlySelectOne.includes(unit.typeId)
          );
        }
      }

      selectedFinal.sort((a, b) => {
        return a.typeId - b.typeId;
      });

      unstable_batchedUpdates(() => {
        setSelectedUnits(selectedFinal.slice(0, 12));
      });
    };

    const mouseLeaveListener = () => {
      this.pointer();
      clearDragElement();
      mousedown = false;
    };

    gameSurface.canvas.addEventListener("pointerdown", mouseDownListener, {
      passive: true,
    });

    gameSurface.canvas.addEventListener("pointermove", mouseMoveListener, {
      passive: true,
    });

    gameSurface.canvas.addEventListener("pointerup", mouseUpListener, {
      passive: true,
    });

    gameSurface.canvas.addEventListener("pointerleave", mouseLeaveListener, {
      passive: true,
    });

    this._dispose = () => {
      gameSurface.canvas.removeEventListener("pointerdown", mouseDownListener);
      gameSurface.canvas.removeEventListener("pointermove", mouseMoveListener);
      gameSurface.canvas.removeEventListener("pointerup", mouseUpListener);
      gameSurface.canvas.removeEventListener(
        "pointerleave",
        mouseLeaveListener
      );

      // clearInterval(_hoverInterval);
      this.selectElement.remove();
    };
  }

  dispose() {
    if (this._interval) {
      clearInterval(this._interval);
    }
    window.document.body.style.cursor = "";
    window.document.getElementById("cursor-styles")?.remove();
    this._dispose && this._dispose();
  }
}
export default MouseInteraction;
