export function overlayImage(out: Uint8Array, overlay: Uint8Array) {
  for (let i = 0; i < out.byteLength; i = i + 3) {
    //add details to walkable layer via blue channel
    if (overlay[i] === 0 && overlay[i + 1] === 0) {
      out[i] = out[i] + overlay[i + 2];
      out[i + 1] = out[i + 1] + overlay[i + 2];
      out[i + 2] = out[i + 2] + overlay[i + 2];
    } else {
      out[i] = overlay[i];
      out[i + 1] = overlay[i + 1];
      out[i + 2] = overlay[i + 2];
    }
  }
}
