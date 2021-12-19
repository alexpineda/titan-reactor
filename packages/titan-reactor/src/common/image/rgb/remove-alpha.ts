export const removeAlphaChannel = (buf: Buffer) => {
  const rgb = Buffer.alloc((buf.byteLength * 3) / 4);
  for (
    let pos = 0, out = 0;
    pos < buf.byteLength, out < rgb.byteLength;
    pos += 4, out += 3
  ) {
    rgb[out] = buf.readUInt8(pos);
    rgb[out + 1] = buf.readUInt8(pos + 1);
    rgb[out + 2] = buf.readUInt8(pos + 2);
  }
  return rgb;
};
