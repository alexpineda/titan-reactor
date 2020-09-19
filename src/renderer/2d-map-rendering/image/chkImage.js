export const chkImage = async (chk, width, height, colorAtMega) => {
  return await chk.image(width, height, {
    startLocations: false,
    sprites: false,
    colorAtMega,
  });
};
