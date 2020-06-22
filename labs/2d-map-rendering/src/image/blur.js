// modified from https://codepen.io/uriuriuriu/pen/zEnlq?editors=1010
export function blur(out, width, height, radius) {
  let blurRange = radius * 3; // ガウス分布 σ
  let gaussparam = []; // ガウス分布係数
  //ガウス分布配列作成
  for (let i = 0; i <= blurRange; i++) {
    gaussparam[i] = Math.exp((-i * i) / (2 * radius * radius));
  }

  // blur y
  switchXY(width, height, out, true);
  blurX(width, height, out);

  // blur x
  switchXY(width, height, out, false);
  blurX(width, height, out);

  function blurX(width, height, out) {
    const from = Uint8Array.from(out);

    let ox, oy, gauss, count, R, G, B, A;
    for (let i = 0, len = width * height; i < len; i++) {
      gauss = count = R = G = B = A = 0;
      ox = i % width;
      oy = (i / width) | 0; // = Math.floor(i / width);
      for (let x = -1 * blurRange; x <= blurRange; x++) {
        let tx = ox + x;
        if (0 <= tx && tx < width) {
          gauss = gaussparam[x < 0 ? -x : x]; // = [Math.abs(x)]
          let k = i + x;
          R += from[k * 3 + 0] * gauss;
          G += from[k * 3 + 1] * gauss;
          B += from[k * 3 + 2] * gauss;
          count += gauss;
        }
      }
      out[i * 3 + 0] = (R / count) | 0;
      out[i * 3 + 1] = (G / count) | 0;
      out[i * 3 + 2] = (B / count) | 0;
    }
  }

  function switchXY(width, height, out, clockwiseFlg) {
    const from = Uint8Array.from(out);
    // 行列入れ替え

    if (clockwiseFlg) {
      for (let i = 0, len = width * height; i < len; i++) {
        const k = (i % width) * height + ((i / width) | 0);
        out[k * 3] = from[i * 3];
        out[k * 3 + 1] = from[i * 3 + 1];
        out[k * 3 + 2] = from[i * 3 + 2];
      }
    } else {
      for (let i = 0, len = width * height; i < len; i++) {
        const k = (i % width) * height + ((i / width) | 0);
        out[i * 3] = from[k * 3];
        out[i * 3 + 1] = from[k * 3 + 1];
        out[i * 3 + 2] = from[k * 3 + 2];
      }
    }
  }
}
