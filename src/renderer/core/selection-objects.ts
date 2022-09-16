import { SelectionCircle } from "@core/selection-circle";
import { SelectionBars } from "@core/selection-bars";
import range from "common/utils/range";
import { Camera, Group, Vector3 } from "three";
import { SpriteDAT, SpriteType } from "common/types";
import { Unit } from "@core";
import { SpriteEntities } from "@core/sprite-entities";
import Janitor from "@utils/janitor";
import { Assets } from "@image/assets";

export class SelectionObject extends Group {

    #circle = new SelectionCircle();
    #bars = new SelectionBars();

    constructor() {
        super();
        this.visible = false;
        this.add(this.#circle);
        this.add(this.#bars);
    }

    update(unit: Unit, sprite: SpriteType, spriteDat: SpriteDAT, completedUpgrades: number[]) {
        this.#circle.update(spriteDat);
        this.#bars.update(unit, spriteDat, completedUpgrades, sprite.renderOrder);

        this.position.copy(sprite.position);
        this.lookAt(this.position.x - _cameraWorldDirection.x, this.position.y - _cameraWorldDirection.y, this.position.z - _cameraWorldDirection.z);
        this.updateMatrixWorld();
    }

}

export const createSelectionDisplayComposer = (assets: Assets) => {

    const objects = range(0, 12).map(_ => new SelectionObject());

    const hideSelections = () => {
        for (const selectionObject of objects) {
            selectionObject.visible = false;
        }
    }

    function update(camera: Camera, sprites: SpriteEntities, completedUpgrades: number[][], selectedUnits: Unit[]) {
        camera.getWorldDirection(_cameraWorldDirection);
        let sprite: SpriteType | undefined;

        for (let i = 0; i < 12; i++) {
            const unit = selectedUnits[i];
            objects[i].visible = !!unit;
            if (unit) {
                sprite = sprites.get(unit.spriteIndex)
                if (sprite) {
                    objects[i].update(unit, sprite, assets.bwDat.sprites[sprite.userData.typeId], completedUpgrades[unit.owner]);
                } else {
                    console.warn("No sprite found for unit", unit);
                }

            }
        }
    }

    return {
        objects,
        hideSelections,
        update,
        dispose() {
            const janitor = new Janitor();
            janitor.dispose(this);
        }
    }

}

const _cameraWorldDirection = new Vector3();