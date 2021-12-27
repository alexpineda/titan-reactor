
declare module "bw-chk" {

    class ChkUnit {
        x: number;
        y: number;
        unitId: number;
        player: number;
        resourceAmt: number;
        sprite?: number;
        isDisabled?: boolean;
    };

    class ChkSprite {
        x: number;
        y: number;
        spriteId: number;
        isDisabled: boolean;
    };

    export default class Chk {
        title: string | "";
        description: string | "";
        tileset: number;
        units: ChkUnit[];
        sprites: ChkSprite[];
        _tiles: Buffer;
        size: [number, number];
        constructor(data: Buffer);
    }
}