import SelectionCircle from "@core/selection-circle";
import SelectionBars from "@core/selection-bars";
import range from "common/utils/range";
import gameStore from "@stores/game-store";
import DirectionalCamera from "renderer/camera/directional-camera";
import { Group, Vector3 } from "three";
import { SpriteDAT, SpriteType } from "common/types";
import { Unit } from "@core";
import { useSelectedUnitsStore } from "@stores/selected-units-store";
import { completedUpgrades } from "./completed-upgrades";
import { SpriteEntities } from "./sprite-entities";

export interface SelectionObject extends Group {
    userData: {
        circle: SelectionCircle;
        bars: SelectionBars;
        update(unit: Unit, sprite: SpriteType, spriteDat: SpriteDAT, completedUpgrades: number[]): void;
    }
}

export const selectionObjects = range(0, 12).map(_ => {
    const selectionObject = new Group() as SelectionObject;
    selectionObject.visible = false;
    selectionObject.userData = {
        circle: new SelectionCircle(),
        bars: new SelectionBars(),
        update(unit: Unit, sprite: SpriteType, spriteDat: SpriteDAT, completedUpgrades: number[]) {
            selectionObject.userData.circle.update(spriteDat);
            selectionObject.userData.bars.update(unit, spriteDat, completedUpgrades, sprite.renderOrder);
            selectionObject.position.copy(sprite.position);
            selectionObject.lookAt(selectionObject.position.x - _cameraWorldDirection.x, selectionObject.position.y - _cameraWorldDirection.y, selectionObject.position.z - _cameraWorldDirection.z);
            selectionObject.updateMatrixWorld();
        }
    };
    selectionObject.add(selectionObject.userData.circle);
    selectionObject.add(selectionObject.userData.bars);
    return selectionObject;
});

export const hideSelections = () => {
    for (const selectionObject of selectionObjects) {
        selectionObject.visible = false;
    }
}

export function updateSelectionGraphics(camera: DirectionalCamera, sprites: SpriteEntities) {
    const bwDat = gameStore().assets!.bwDat;
    camera.getWorldDirection(_cameraWorldDirection);
    let sprite: SpriteType | undefined;

    for (let i = 0; i < 12; i++) {
        const unit = useSelectedUnitsStore.getState().selectedUnits[i];
        selectionObjects[i].visible = !!unit;
        if (unit) {
            sprite = sprites.get(unit.spriteIndex)
            if (sprite) {
                selectionObjects[i].userData.update(unit, sprite, bwDat.sprites[sprite.userData.typeId], completedUpgrades[unit.owner]);
            } else {
                console.warn("No sprite found for unit", unit);
            }

        }
    }
}

const _cameraWorldDirection = new Vector3();