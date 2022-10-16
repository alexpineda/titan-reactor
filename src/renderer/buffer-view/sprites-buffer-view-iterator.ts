import { OpenBW } from "common/types";
import { IntrusiveList } from "./intrusive-list";
import { SpritesBufferView } from "./sprites-buffer-view";

export class SpritesBufferViewIterator {
    #openBWRef: WeakRef<OpenBW>;
    #sprites: SpritesBufferView;

    get #openBW() {
        return this.#openBWRef.deref();
    }

    constructor( openBW: OpenBW ) {
        this.#openBWRef = new WeakRef( openBW );
        this.#sprites = new SpritesBufferView( openBW );
    }

    *[Symbol.iterator]() {
        const spriteList = new IntrusiveList( this.#openBW!.HEAPU32 );
        const spriteTileLineSize = this.#openBW!.getSpritesOnTileLineSize();
        const spritetileAddr = this.#openBW!.getSpritesOnTileLineAddress();
        for ( let l = 0; l < spriteTileLineSize; l++ ) {
            spriteList.addr = spritetileAddr + ( l << 3 );
            for ( const spriteAddr of spriteList ) {
                if ( spriteAddr === 0 ) {
                    continue;
                }
                yield this.#sprites.get( spriteAddr );
            }
        }
    }

    getSprite( addr: number ) {
        return this.#sprites.get( addr );
    }
}

export function* deletedSpritesIterator( openBW: OpenBW ) {
    const deletedSpriteCount = openBW._counts( 16 );
    const deletedSpriteAddr = openBW._get_buffer( 4 );

    for ( let i = 0; i < deletedSpriteCount; i++ ) {
        yield openBW.HEAP32[( deletedSpriteAddr >> 2 ) + i];
    }
}
