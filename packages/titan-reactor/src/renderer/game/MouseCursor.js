import { Raycaster, Vector2 } from "three";
import { unstable_batchedUpdates } from "react-dom";
import GameSprite from "./GameSprite";
import useGameStore from "../stores/gameStore";

const setSelectedUnits = useGameStore.getState().setSelectedUnits;

function intersectRect(r1, r2) {
  return !(
    r2.left > r1.right ||
    r2.right < r1.left ||
    r2.top > r1.bottom ||
    r2.bottom < r1.top
  );
}

export default class MouseCursor {
  constructor(arrowIcons, hoverIcons, dragIcons) {
    this.arrowIcons = arrowIcons;
    this.arrowIconsIndex = 0;
    this.hoverIcons = hoverIcons;
    this.hoverIconsIndex = 0;
    this.dragIcons = dragIcons;
    this.dragIconsIndex = 0;

    this._interval = setInterval(() => {
      this.arrowIconsIndex =
        (this.arrowIconsIndex + 1) % this.arrowIcons.length;
      this.hoverIconsIndex =
        (this.hoverIconsIndex + 1) % this.hoverIcons.length;
      this.dragIconsIndex = (this.dragIconsIndex + 1) % this.dragIcons.length;
      this._updateIcon();
    }, 250);

    const style = document.createElement("style");
    document.head.appendChild(style);
    style.appendChild(
      document.createTextNode(`
      ${this.arrowIcons
        .map(
          (icon, i) => `
          .cursor-pointer-${i} {
            cursor: url(${icon}), auto
          }
        `
        )
        .join("\n")}
        
      ${this.hoverIcons
        .map(
          (icon, i) => `
          .cursor-hover-${i} {
            cursor: url(${icon}), auto
          }
        `
        )
        .join("\n")}

      ${this.dragIcons
        .map(
          (icon, i) => `
          .cursor-drag-${i} {
            cursor: url(${icon}), auto
          }
        `
        )
        .join("\n")}
  `)
    );

    this.selectElement = document.createElement("span");
    this.selectElement.style.outline = "2px solid #00ff007f";
    this.selectElement.style.position = "absolute";
    this.selectElement.style.display = "none";
    this.selectElement.style.pointerEvents = "none";
    document.body.appendChild(this.selectElement);
  }

  _updateClasses(index, type = "pointer") {
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
  }

  hover() {
    this._pointer = this.hoverIcons;
  }

  drag() {
    this._pointer = this.dragIcons;
  }

  init(
    projectedCameraView,
    gameSurface,
    scene,
    camera,
    unitsBySpriteId,
    terrain
  ) {
    this.projectedCameraView = projectedCameraView;

    const raycaster = new Raycaster();
    const mouse = new Vector2();
    const hover = new Vector2();

    let start = { x: 0, y: 0 };
    let end = { x: 0, y: 0 };
    let mousedown = false;
    let enableHoverIntersecting = false;

    const intersectMouse = (clipV, sprites = null) => {
      raycaster.setFromCamera(clipV, camera);
      // calculate objects intersecting the picking ray
      const intersects = raycaster.intersectObject(scene, true);
      if (intersects.length) {
        let closestSprite = { renderOrder: -1 };
        intersects.forEach((intersect) => {
          const { object, uv } = intersect;
          if (
            object.sprite &&
            object.sprite.unit &&
            object.sprite.unit.canSelect &&
            object.sprite.mainImage &&
            object.sprite.mainImage.lastSetFrame &&
            object.sprite.mainImage.intersects(uv.x, uv.y)
          ) {
            if (sprites) {
              sprites.add(object.sprite);
            } else if (object.sprite.renderOrder > closestSprite.renderOrder) {
              closestSprite = object.sprite;
            }
          }
        });
        if (closestSprite instanceof GameSprite) {
          return closestSprite;
        }
      }
    };

    const _hoverInterval = setInterval(() => {
      if (!enableHoverIntersecting) return;

      hover.x = (end.x / gameSurface.width) * 2 - 1;
      hover.y = -(end.y / gameSurface.height) * 2 + 1;

      const sprite = intersectMouse(hover);
      if (sprite) {
        this.hover();
      } else {
        this.pointer();
      }
    }, 60);

    const isMinDragSize = () =>
      Math.abs(end.x - start.x) > 10 && Math.abs(end.y - start.y) > 10;

    const updateDragElement = () => {
      const l = Math.min(start.x, end.x);
      const r = Math.max(start.x, end.x);
      const t = Math.min(start.y, end.y);
      const b = Math.max(start.y, end.y);

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

    const mouseDownListener = (event) => {
      if (event.button !== 0) return;

      start.x = event.offsetX;
      start.y = event.offsetY;

      end.x = event.offsetX + 1;
      end.y = event.offsetY + 1;

      mousedown = true;
    };

    const mouseMoveListener = (event) => {
      enableHoverIntersecting = !mousedown;

      if (mousedown && isMinDragSize()) {
        this.drag();
        initDragElement();
        updateDragElement();
      }
      end.x = event.offsetX;
      end.y = event.offsetY;
    };

    const mouseUpListener = (event) => {
      this.pointer();
      clearDragElement();

      if (!mousedown) return;
      mousedown = false;

      const selected = new Set();

      if (isMinDragSize()) {
        const [width, height] = [gameSurface.width, gameSurface.height];
        const startV = new Vector2();
        const endV = new Vector2();
        const l = Math.min(start.x, end.x);
        const r = Math.max(start.x, end.x);
        const t = Math.min(start.y, end.y);
        const b = Math.max(start.y, end.y);

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
          const startMapX = Math.floor(point.x + scene.mapWidth / 2);
          const startMapY = Math.floor(point.z + scene.mapHeight / 2);
          const endMapX = Math.floor(point2.x + scene.mapWidth / 2);
          const endMapY = Math.floor(point2.z + scene.mapHeight / 2);

          const r1 = {
            left: startMapX * 32,
            top: startMapY * 32,
            right: endMapX * 32,
            bottom: endMapY * 32,
          };

          const r2 = { left: 0, right: 0, top: 0, bottom: 0 };

          const candidates = [];

          for (let x = startMapX - 1; x < endMapX + 1; x++) {
            for (let y = startMapY - 1; y < endMapY + 1; y++) {
              for (const [spriteId, unit] of unitsBySpriteId) {
                if (unit.canSelect && unit.tileX === x && unit.tileY === y) {
                  // test one tile out of selection bounds since unit tileX/Y is centered
                  // use placement approximations from UnitsDat for these "slightly out of bounds" units
                  if (
                    x === startMapX - 1 ||
                    x === endMapX + 1 ||
                    y === startMapY - 1 ||
                    y === endMapY + 1
                  ) {
                    r2.left = unit.x - unit.unitType.unitSizeLeft;
                    r2.right = unit.x + unit.unitType.unitSizeRight;
                    r2.top = unit.y - unit.unitType.unitSizeUp;
                    r2.bottom = unit.y + unit.unitType.unitSizeDown;
                    if (intersectRect(r1, r2)) {
                      candidates.push(unit);
                      if (!unit.unitType.isBuilding) {
                        selected.add(unit);
                      }
                    }
                  } else {
                    candidates.push(unit);
                    if (!unit.unitType.isBuilding) {
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
        sprite.unit.canSelect &&
        !(
          selected.size &&
          (sprite.unit.unitType.isResourceContainer ||
            sprite.unit.unitType.isBuilding)
        )
      ) {
        // ctrl modifier -> select all of unit type in view
        if (event.ctrlKey) {
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
              for (const [spriteId, unit] of unitsBySpriteId) {
                if (
                  unit.canSelect &&
                  unit.tileX === x &&
                  unit.tileY === y &&
                  unit.unitType === sprite.unit.unitType
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

      unstable_batchedUpdates(() =>
        setSelectedUnits(selectedFinal.slice(0, 12))
      );
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

      clearInterval(_hoverInterval);
      this.selectElement.remove();
    };
  }

  dispose() {
    clearInterval(this._interval);
    window.document.body.style.cursor = "default";
    this._dispose();
  }
}
