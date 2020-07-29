export const mapImage = async (chk, width, height, colorAtMega) => {
  console.log("chk image");
  const image = await chk.image(width, height, {
    startLocations: false,
    sprites: false,
    colorAtMega,
  });
  console.log("chk image end");

  return image;
};
