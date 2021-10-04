export default {
  renderer: {
    parent: "scene",
    values: {
      toneMapping: "ACESFilmicToneMapping",
      toneMappingExposure: 1,
      fogColor: "#080820",
      fogEnabled: true,
    },
    args: {
      toneMapping: [
        "NoToneMapping",
        "LinearToneMapping",
        "ReinhardToneMapping",
        "CineonToneMapping",
        "ACESFilmicToneMapping",
      ],
    },
  },
  // camera: {
  //   parent: "scene",
  //   values: {
  //     zoom: 1,
  //     fov: 75,
  //     near: 0.1,
  //     far: 1000,
  //     free: false,
  //     rotate: false,
  //     focus: 10,
  //   },
  //   args: {},
  // },
  // cinematic: {
  //   parent: "scene",
  //   args: {},
  //   values: {
  //     focalLength: 15,
  //     shaderFocus: false,
  //     fstop: 2.8,

  //     showFocus: false,
  //     focalDepth: 0.1,

  //     coc: 0.019,
  //   },
  // },
  // map: {
  //   parent: "scene",
  //   values: {
  //     showElevations: false,
  //     showWireframe: false,
  //     showBackgroundTerrain: true,
  //   },
  //   args: {},
  // },
  dirlight: {
    parent: "scene",
    values: {
      intensity: 7,
      color: "#ffffff",
      x: -40,
      y: 20,
      z: -60,
      x2: 0,
      y2: 0,
      z2: 0,
      helper: false,
    },
    args: {},
  },
  // pointlight: {
  //   parent: "scene",
  //   values: {
  //     color: "#ffffff",
  //     decay: 0,
  //     distance: 60,
  //     power: 40,
  //   },
  //   args: {},
  // },
  hemilight: {
    parent: "scene",
    values: {
      intensity: 6,
      skyColor: "#ffffff",
      groundColor: "#ffffff",
    },
    args: {},
  },
  // spotlight: {
  //   parent: "scene",
  //   values: {
  //     positionY: 50,
  //     positionX: 80,
  //     positionZ: 80,
  //     castShadow: true,
  //     shadowBias: -0.0001,
  //     decay: 3.7,
  //     distance: 100,
  //     penumbra: 0.5,
  //     power: 0,
  //     color: "#ffa95c",
  //     helper: false,
  //   },
  //   args: {},
  // },
  // roughness: {
  //   parent: "textures",
  //   values: {
  //     elevations: "1 1 1 1 1 1 1",
  //     detailsRatio: "0.5 0 0 0 0 0 0",
  //     textureScale: 0.5,
  //     effectScale: 1,
  //     water: true,
  //     lava: false,
  //     twilight: false,
  //     skipDetails: false,
  //     onlyWalkable: false,
  //     show: false,
  //   },
  //   args: {},
  // },
  // displacementBase: {
  //   parent: "textures",
  //   values: {
  //     elevations: "0, 0.4, 0.79, 0.85, 1, 1, 0.85",
  //     detailsRatio: "0.15, 0.15, 0.075, 0.15, 0.15, 0.075, 0",
  //     scale: 0.25,
  //     water: false,
  //     lava: false,
  //     twilight: false,
  //     blur: 16,
  //     show: false,
  //   },
  //   args: {},
  // },

  // displacementOverlay: {
  //   parent: "textures",
  //   values: {
  //     elevations: "0, 0.4, 0.79, 0.85, 1, 1, 0.85",
  //     detailsRatio: "0.15, 0.15, 0.075, 0.15, 0.15, 0.075, 0",
  //     scale: 0.25,
  //     water: false,
  //     lava: false,
  //     twilight: false,
  //     blur: 6,
  //   },
  //   args: {},
  // },

  // displacementMix: {
  //   parent: "textures",
  //   values: {
  //     scale: 6,
  //     show: false,
  //   },
  //   args: {},
  // },

  // emissive: {
  //   parent: "textures",
  //   values: {
  //     elevations: "1 1 1 1 1 1 1",
  //     detailsRatio: "0.5 0 0 0 0 0 0",
  //     textureScale: 0.5,
  //     effectScale: 1,
  //     blur: 0,
  //     water: false,
  //     lava: false,
  //     twilight: false,
  //     skipDetails: false,
  //     onlyWalkable: false,
  //     show: false,
  //   },
  //   args: {},
  // },

  // metallic: {
  //   parent: "textures",
  //   values: {
  //     elevations: "1 1 1 1 1 1 1",
  //     detailsRatio: "0.5 0 0 0 0 0 0",
  //     textureScale: 0.5,
  //     effectScale: 1,
  //     displacementScale: 6,
  //     blur: 0,
  //     water: false,
  //     lava: false,
  //     twilight: false,
  //     skipDetails: false,
  //     onlyWalkable: false,
  //     show: false,
  //   },
  //   args: {},
  // },
};