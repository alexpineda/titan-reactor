// thanks to farty
// HD tileset effects for ashworld, badlands, desert, ice, jungle, twilight
export default (buf) => {
  const filetype = buf.readUInt32LE(0); // 'KSMT'
  const unk1 = buf.readUInt16LE(4);
  const count = buf.readUInt16LE(6);

  let pos = 8;

  let masks = [];
  for (let i = 0; i < count; i++) {
    const vr4id = buf.readUInt16LE(pos);
    const maskid = buf.readUInt16LE(pos + 2);
    pos = pos + 4;
    masks.push({ vr4id, maskid, index: i });
  }
  return masks;
};
