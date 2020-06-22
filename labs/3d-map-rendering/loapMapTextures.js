export function loadMapDetails(map) {}

export function loadTerrain(map) {}

export function loadTerrainBackground(map) {}

export function loadDisplacement(map) {}

export function loadRoughness(map) {}

export function loadAllMapTextures(map) {
  const flip = (texture) => {
    texture.wrapS = THREE.RepeatWrapping;
    texture.repeat.x = -1;
    texture.flipY = false;
  };
  const toDataTexture = ({ data, width, height }) =>
    new THREE.DataTexture(data, width, height, THREE.RGBFormat);

  const mapDetailsLoader = new Promise((res, rej) => {
    fs.createReadStream(`./maps/${map}`)
      .pipe(createScmExtractor())
      .pipe(
        concat((data) => {
          res(generateMapDetails(data));
        })
      );
  });

  const mapLoader = new Promise((res, rej) => {
    fs.createReadStream(`./maps/${map}`)
      .pipe(createScmExtractor())
      .pipe(
        concat((data) => {
          generateMap({
            bwDataPath: "./bwdata",
            scmData: data,
            scale: 1,
            blurFactor: 0,
          }).then((data) => res(toDataTexture(data)), rej);
        })
      );
  });

  const bgLoader = new Promise((res, rej) => {
    fs.createReadStream(`./maps/${map}`)
      .pipe(createScmExtractor())
      .pipe(
        concat((data) => {
          generateMap({
            bwDataPath: "./bwdata",
            scmData: data,
            scale: 0.25 * 0.25,
            blurFactor: 32,
          }).then((data) => res(toDataTexture(data)), rej);
        })
      );
  });

  const displaceLoader = new Promise((res, rej) => {
    fs.createReadStream(`./maps/${map}`)
      .pipe(createScmExtractor())
      .pipe(
        concat((data) => {
          generateDisplacementMap({
            bwDataPath: "./bwdata",
            scmData: data,
            scale: 0.25,
            elevations: [0, 0.4, 0.79, 0.85, 1, 1, 0.85],
            detailsElevations: [1, 1, 0.5, 1, 0.5, 1, 0],
            detailsRatio: [0.15, 0.15, 0.15, 0.15, 0.15, 0.15, 0.15],
            walkableLayerBlur: 24,
            allLayersBlur: 8,
          }).then((data) => res(toDataTexture(data)), rej);
        })
      );
  });

  control.on("roughness", (opts) => {
    console.log("on:roughness", opts);
  });

  const roughnessLoader = (opts = {}) =>
    new Promise((res, rej) => {
      fs.createReadStream(`./maps/${map}`)
        .pipe(createScmExtractor())
        .pipe(
          concat((data) => {
            generateRoughnessMap({
              bwDataPath: "./bwdata",
              scmData: data,
              elevations: [1, 1, 1, 1, 1, 1, 1],
              detailsElevations: [1, 0, 0, 0, 0, 0, 0],
              detailsRatio: [0.5, 0, 0, 0, 0, 0, 0],
              scale: 0.5,
              blur: 0,
              water: false,
              lava: true,
              twilight: false,
              skipDetails: false,
              onlyWalkable: false,
              ...opts,
            }).then((data) => res(toDataTexture(data)), rej);
          })
        );
    });

  Promise.all([
    mapDetailsLoader,
    mapLoader,
    bgLoader,
    displaceLoader,
    roughnessLoader(),
  ]).then(([mapDetails, map, bg, displace, roughness]) => {
    map.encoding = THREE.sRGBEncoding;
    bg.encoding = THREE.sRGBEncoding;

    flip(map);
    flip(bg);
    flip(displace);
    flip(roughness);

    const [newFloor, newFloorBg] = generateMapMeshes(
      mapDetails.size[0],
      mapDetails.size[1],
      map,
      bg,
      displace,
      roughness
    );

    const floor = findMeshByName("floor");
    const floorBg = findMeshByName("backing-floor");
    if (floor) {
      scene.remove(floor);
    }
    if (floorBg) {
      scene.remove(floorBg);
    }
    scene.add(newFloor);
    scene.add(newFloorBg);
  });
}
