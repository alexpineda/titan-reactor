const fs = require("fs");

export const mapLoader = (map) => {
  const path = `./maps/${map}`;
  console.log("mapLoader", path);

  return new Promise((res, rej) => {
    fs.exists(path, (exists) => {
      console.log("exists", exists);
      if (exists) {
        res(loadImage(path));
      } else {
        res(loadMap(path));
      }
    });
  });
};

function loadImage(path) {
  console.log("load image");
  return new Promise((res, rej) =>
    new THREE.TextureLoader().load(
      path,
      (t) => res(encoding(t)),
      () => {},
      rej
    )
  );
}
function loadMap(path) {
  console.log("load map");
  return new Promise((res, rej) => {
    fs.createReadStream(`./maps/${map}`)
      .pipe(createScmExtractor())
      .pipe(
        concat((data) => {
          generateMap({
            bwDataPath: "./bwdata",
            scmData: data,
            scale: 1,
            blurFactor: 0,
          })
            // .then(({ data, width, height }) => {
            //   savePNG(data, width, height, `${map}-map`);
            //   return { data, width, height };
            // })
            .then(rgbToCanvas)
            .then((canvas) => new THREE.CanvasTexture(canvas))
            .then(encoding)
            .then(res, rej);
        })
      );
  });
}
