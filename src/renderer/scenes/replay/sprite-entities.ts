import { Unit } from "@core/unit";
import { SparseList } from "@utils/sparse-list";
import { SpriteType } from "common/types";
import { Group } from "three";

export class SpriteEntities {
    group = new Group();

    #spritesMap: Map<number, SpriteType> = new Map();
    #spritePool: Group[] = [];

    // duplicate access
    #unitsBySprite: Map<number, Unit> = new Map();
    #spritesList = new SparseList<SpriteType>();

    constructor() {
        this.group.name = "sprites";
    }

    get(spriteIndex: number) {
        return this.#spritesMap.get(spriteIndex);
    }

    getOrCreate(spriteIndex: number, spriteTypeId: number) {
        let sprite = this.#spritesMap.get(spriteIndex);
        if (!sprite) {
            if (this.#spritePool.length) {
                sprite = this.#spritePool.pop() as SpriteType;
            } else {
                sprite = new Group() as SpriteType;
                sprite.name = "sprite";
            }
            this.#spritesMap.set(spriteIndex, sprite);
            this.group.add(sprite);
            this.#spritesList.add(sprite);

            sprite.userData.typeId = spriteTypeId;
            delete sprite.userData.fixedY;

            sprite.matrixAutoUpdate = false;

        }
        return sprite;
    }

    free(spriteIndex: number) {
        const sprite = this.#spritesMap.get(spriteIndex);
        if (sprite) {
            sprite.removeFromParent();
            this.#spritePool.push(sprite);
            this.#spritesMap.delete(spriteIndex);
            this.#spritesList.delete(sprite);
        }
        this.#unitsBySprite.delete(spriteIndex);
    }

    clear() {
        this.#spritesMap.clear();
        this.#unitsBySprite.clear();
        this.#spritesList.clear();
    }

    getUnit(spriteIndex: number) {
        return this.#unitsBySprite.get(spriteIndex);
    }

    setUnit(spriteIndex: number, unit: Unit) {
        this.#unitsBySprite.set(spriteIndex, unit);
    }

    get iterator() {
        return this.#spritesList;
    }
}