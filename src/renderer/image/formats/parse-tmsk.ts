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

    const map = new Map<number, number>();

    let pos = 8;

    range(0, count).forEach(_ => {

        const vr4id = buffer.readUInt16LE(pos);
        const maskid = buffer.readUInt16LE(pos + 2);

        pos = pos + 4;

        map.set(vr4id, maskid);

    })

    return map;
};

// u32 getMaskID(u32 vr4id){ u32 i;for(i=0;i<tmsk->count;i++) if(tmsk->tileMasks[i].vr4id == vr4id) return tmsk->tileMasks[i].maskid; return 0xFFFFFFFF; }

// mask = getMaskID(t);
// if(mask == 0xFFFFFFFF || water_normal_1 == NULL){
//   drawGRP(tileset, tileset->width/2 + tileset->width*i, tileset->height/2 + tileset->width*j, t, 0xFFFFFFFF);
// }else{
//   drawGRPWater(tileset, tileset->width/2 + tileset->width*i, tileset->height/2 + tileset->width*j, t, tileMask->tex[mask], water_normal_1, water_normal_2, n1frame, n2frame, winwidth, winheight, time);
// }