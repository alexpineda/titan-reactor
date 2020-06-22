export function blendNonZeroPixels(out, width, height) {
  const isBlack = (p) => p[0] === 0 && p[1] === 0 && p[2] === 0;
  const getColorAtP = (p) => out.slice(p * 3, p * 3 + 3);
  const setColorAtP = (p, c) => {
    out[p * 3] = c[0];
    out[p * 3 + 1] = c[1];
    out[p * 3 + 2] = c[2];
  };

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const p = y * width + x;

      //if black
      //find length to next color
      //if all black skip row
      //if p == 0 fill from next color
      //if p == width fill from prev color
      //if fill half prevColor, half nextColor

      if (isBlack(getColorAtP(p))) {
        // find length to next color
        let prevColor = getColorAtP(Math.max(p - 1, 0));
        let nextColor = getColorAtP(p);
        let j = 0;
        while (isBlack(nextColor)) {
          if (x + j + 1 >= width) {
            break;
          }
          j = j + 1;

          nextColor = getColorAtP(p + j);
        }
        // if all black skip row
        if (x === 0 && isBlack(nextColor)) {
          break;
        } else if (x === 0) {
          prevColor = nextColor;
        }
        if (isBlack(nextColor)) {
          nextColor = prevColor;
        }

        //if fill half prevColor, half nextColor
        for (let k = 0; k < Math.floor(j / 2); k++) {
          setColorAtP(p + k, prevColor);
        }
        for (let k = 0; k < Math.ceil(j / 2); k++) {
          setColorAtP(p + j - k, nextColor);
        }
        x = x + j;
      }
    }
  }
}

export function overlayImage(out, overlay) {
  
  for (let i = 0; i < out.byteLength; i = i + 3) {
    //add details to walkable layer via blue channel
    if (overlay[i] === 0 && overlay[i+1] === 0 ) {
      out[i] = out[i] + overlay[i+2]
      out[i+1] = out[i+1] + overlay[i+2]
      out[i+2] = out[i+2] + overlay[i+2]
    } else {
      out[i] = overlay[i];
      out[i + 1] = overlay[i + 1];
      out[i + 2] = overlay[i + 2];
    }
  }
}
