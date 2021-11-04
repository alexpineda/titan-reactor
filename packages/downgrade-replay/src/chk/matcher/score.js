// 4x4 on off values
const getCenterAndRadius = (minitileFlag, flipX) => {
  let center = [0, 0];

  for (let i = 0; i < minitileFlag.length; i++) {
    const x = flipX ? 3 - (i % 4) : i % 4;
    const y = Math.floor(i / 4);
    // contributes 0, 1, 2 or 3 to the center
    center[0] += minitileFlag[i] ? x : 0;
    center[1] += minitileFlag[i] ? y : 0;
  }
  center[0] /= 4;
  center[1] /= 4;

  let radius = 0;
  for (let i = 0; i < minitileFlag.length; i++) {
    const x = flipX ? 3 - (i % 4) : i % 4;
    const y = Math.floor(i / 4);
    const a = minitileFlag[i] ? x : center[0];
    const b = minitileFlag[i] ? y : center[1];
    radius =
      radius +
      Math.sqrt(Math.abs(a - center[0]) ^ (2 + Math.abs(b - center[1])) ^ 2);
  }
  radius /= 16;

  return [...center, radius];
};

module.exports = { getCenterAndRadius };
