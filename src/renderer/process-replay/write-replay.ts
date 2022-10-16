import BufferList from "bl";
import { HeaderMagicTitanReactor } from "./version";
import { writeBlock } from "./blocks";
import { uint32 } from "./util/alloc";
import { LMTS, writeLMTS } from "./parse-scr-section";

export const writeReplay = (
    rawHeader: Buffer,
    rawCmds: Buffer,
    chk: Buffer,
    limits: LMTS
) => {
    const bl = new BufferList();

    writeBlock( bl, uint32( HeaderMagicTitanReactor ), false );

    writeBlock( bl, writeLMTS( limits ).slice( 0 ), false );

    writeBlock( bl, rawHeader, true );

    writeBlock( bl, uint32( rawCmds.length ), false );
    writeBlock( bl, rawCmds, true );

    writeBlock( bl, uint32( chk.byteLength ), false );
    writeBlock( bl, chk, true );

    return bl.slice( 0 );
};
