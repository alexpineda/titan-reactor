export default (chk, scale = 1) => ({
  width: chk.size[0] * 32 * scale,
  height: chk.size[1] * 32 * scale,
});
