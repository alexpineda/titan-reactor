import range from "common/utils/range";

// thx farty. https://github.com/saintofidiocy/SCR-Graphics
// typedef struct {
//     u32 filetype; // 'KSMT'
//     u16 unk1; // version? 0x0001
//     u16 count;
//     struct {
//       u16 vr4id;  // [tileset].dds.vr4 index
//       u16 maskid; // [tileset]_mask.dds.grp index
//     } tileMasks[1]; // [count]
//   } tmsk_file;

export const parseTMSK = (buffer: Buffer) => {
    const count = buffer.readUInt16LE(6);

    let pos = 8;
    return range(0, count).map(i => {
        const vr4id = buffer.readUInt16LE(pos);
        const maskid = buffer.readUInt16LE(pos + 2);
        pos = pos + 4;

        return { i, vr4id, maskid };
    })
};

// u32 getMaskID(u32 vr4id){ u32 i;for(i=0;i<tmsk->count;i++) if(tmsk->tileMasks[i].vr4id == vr4id) return tmsk->tileMasks[i].maskid; return 0xFFFFFFFF; }