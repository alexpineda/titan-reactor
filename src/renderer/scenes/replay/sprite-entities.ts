import { SpriteType } from "common/types";
import { Group } from "three";

export class SpriteEntities {
    sprites: Map<number, SpriteType> = new Map();
    _spritePool: Group[] = [];
    group = new Group();

    constructor() {
        this.group.name = "sprites";
    }

    get(spriteIndex: number) {
        return this.sprites.get(spriteIndex);
    }

    getOrCreate(spriteIndex: number, spriteTypeId: number) {
        let sprite = this.sprites.get(spriteIndex);
        if (!sprite) {
            if (this._spritePool.length) {
                sprite = this._spritePool.pop() as SpriteType;
            } else {
                sprite = new Group() as SpriteType;
                sprite.name = "sprite";
            }
            this.sprites.set(spriteIndex, sprite);
            this.group.add(sprite);
            sprite.userData.typeId = spriteTypeId;
            sprite.userData.renderTestCount = 0;
            delete sprite.userData.fixedY;
        }
        return sprite;
    }

    free(spriteIndex: number) {
        const sprite = this.sprites.get(spriteIndex);
        if (sprite) {
            sprite.removeFromParent();
            this._spritePool.push(sprite);
            this.sprites.delete(spriteIndex);
        }
    }

    clear() {
        this.sprites.clear();
    }
}