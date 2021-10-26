// thanks to farty
// HD tileset effects for ashworld, badlands, desert, ice, jungle, twilight
export default (buf) => {
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
