export const rgbaToGreyScale = (
  data: Uint8Array | Uint8ClampedArray,
  width: number,
  height: number
) => {
  const out = new Uint8ClampedArray(width * height);

  for (let i = 0; i < data.length; i += 4) {
    out[i >> 2] = (data[i] + data[i + 1] + data[i + 2]) / 3;
  }

  return out;
};
