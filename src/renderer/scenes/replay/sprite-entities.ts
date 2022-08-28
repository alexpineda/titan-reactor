import { Unit } from "@core/unit";
import { SpriteType } from "common/types";
import { Group } from "three";

export class SpriteEntities {
    group = new Group();

    #sprites: Map<number, SpriteType> = new Map();
    #spritePool: Group[] = [];
    #unitsBySprite: Map<number, Unit> = new Map();

    constructor() {
        this.group.name = "sprites";
    }

    get(spriteIndex: number) {
        return this.#sprites.get(spriteIndex);
    }

    getOrCreate(spriteIndex: number, spriteTypeId: number) {
        let sprite = this.#sprites.get(spriteIndex);
        if (!sprite) {
            if (this.#spritePool.length) {
                sprite = this.#spritePool.pop() as SpriteType;
            } else {
                sprite = new Group() as SpriteType;
                sprite.name = "sprite";
            }
            this.#sprites.set(spriteIndex, sprite);
            this.group.add(sprite);
            sprite.userData.typeId = spriteTypeId;
            sprite.userData.renderTestCount = 0;
            delete sprite.userData.fixedY;
        }
        return sprite;
    }

    free(spriteIndex: number) {
        const sprite = this.#sprites.get(spriteIndex);
        if (sprite) {
            sprite.removeFromParent();
            this.#spritePool.push(sprite);
            this.#sprites.delete(spriteIndex);
        }
        this.#unitsBySprite.delete(spriteIndex);
    }

    clear() {
        this.#sprites.clear();
        this.#unitsBySprite.clear();
    }

    getUnit(spriteIndex: number) {
        return this.#unitsBySprite.get(spriteIndex);
    }

    setUnit(spriteIndex: number, unit: Unit) {
        this.#unitsBySprite.set(spriteIndex, unit);
    }
}