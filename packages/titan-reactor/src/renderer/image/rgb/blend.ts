export function blendNonZeroPixels(
  out: Uint8Array,
  width: number,
  height: number
) {
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const p = y * width + x;

      //if black
      //find length to next color
      //if all black skip row
      //if p == 0 fill from next color
      //if p == width fill from prev color
      //if fill half prevColor, half nextColor

      if (out[p] === 0) {
        // find length to next color
        let prevColor = out[Math.max(p - 1, 0)];
        let nextColor = out[p];
        let j = 0;
        while (nextColor === 0) {
          if (x + j + 1 >= width) {
            break;
          }
          j = j + 1;

          nextColor = out[p + j];
        }
        // if all black skip row
        if (x === 0 && nextColor === 0) {
          break;
        } else if (x === 0) {
          prevColor = nextColor;
        }
        if (nextColor === 0) {
          nextColor = prevColor;
        }

        //if fill half prevColor, half nextColor
        for (let k = 0; k < Math.floor(j / 2); k++) {
          out[p + k] = prevColor;
        }
        for (let k = 0; k < Math.ceil(j / 2); k++) {
          out[p + j - k] = nextColor;
        }
        x = x + j;
      }
    }
  }
}
