import * as dat from "dat.gui";
import Stats from "stats.js";

export function createStats() {
  const stats = new Stats();
  stats.showPanel(0);
  document.body.appendChild(stats.dom);
  return stats;
}

export function createGui() {
  const gui = new dat.GUI();

  let control = new (function () {
    const listeners = {};
    const ctrl = this;

    this.on = function (eventName, handler) {
      if (listeners[eventName]) {
        listeners[eventName].push(handler);
      } else {
        listeners[eventName] = [handler];
      }
    };
    const dispatch = function (eventName, eventData) {
      listeners[eventName] &&
        listeners[eventName].forEach((handler) => handler(eventData));
    };

    this.renderer = {
      gamma: 2.2,
      toneMapping: "NoToneMapping",
      toneMappingExposure: 1,
      fogColor: "#080820",
    };

    this.camera = {
      zoom: 1,
      fov: 75,
      near: 0.1,
      far: 1000,
    };

    this.roughness = {
      elevations: "1 1 1 1 1 1 1",
      detailsElevations: "1 0 0 0 0 0 0",
      detailsRatio: "0.5 0 0 0 0 0 0",
      textureScale: 0.5,
      scale: 1,
      blur: 0,
      water: false,
      lava: false,
      twilight: false,
      skipDetails: false,
      onlyWalkable: false,
      regenerate: function () {
        console.log("dispatch:roughness");
        dispatch("roughness", ctrl.roughness);
      },
    };

    this.displacement = {
      elevations: "0, 0.4, 0.79, 0.85, 1, 1, 0.85",
      detailsElevations: "1, 1, 0.5, 1, 0.5, 1, 0",
      detailsRatio: "0.15, 0.15, 0.15, 0.15, 0.15, 0.15, 0.15",
      textureScale: 0.25,
      scale: 6,
      water: false,
      lava: false,
      twilight: false,
      walkableLayerBlur: 16,
      allLayersBlur: 8,
      showMap: false,
      regenerate: function () {
        console.log("dispatch:displacement");
        dispatch("displacement", ctrl.displacement);
      },
    };

    this.emissive = {
      elevations: "1 1 1 1 1 1 1",
      detailsElevations: "1 0 0 0 0 0 0",
      detailsRatio: "0.5 0 0 0 0 0 0",
      textureScale: 0.5,
      scale: 1,
      blur: 0,
      water: false,
      lava: false,
      twilight: false,
      skipDetails: false,
      onlyWalkable: false,
      regenerate: function () {
        console.log("dispatch:emissive");
        dispatch("emissive", ctrl.emissive);
      },
    };

    this.metallic = {
      elevations: "1 1 1 1 1 1 1",
      detailsElevations: "1 0 0 0 0 0 0",
      detailsRatio: "0.5 0 0 0 0 0 0",
      textureScale: 0.5,
      scale: 1,
      displacementScale: 6,
      blur: 0,
      water: false,
      lava: false,
      twilight: false,
      skipDetails: false,
      onlyWalkable: false,
      regenerate: function () {
        console.log("dispatch:metallic");
        dispatch("metallic", ctrl.metallic);
      },
    };

    this.pointlight = {
      power: 1000,
      color: "#ffffff",
    };

    this.dirlight = {
      power: 8,
      color: "#ffffff",
    };

    this.hemilight = {
      power: 0,
      color1: "#ffffff",
      color2: "#ffffff",
    };

    this.spotlight = {
      positionY: 50,
      positionX: 80,
      positionZ: 80,
      castShadow: true,
      shadowBias: -0.0001,
      decay: 2,
      distance: 10,
      penumbra: 0.2,
      power: 1000,
      color: "#ffa95c",
      reload: function () {
        console.log("dispatch:spotlight");
        dispatch("spotlight");
      },
    };

    this.map = {
      showElevations: false,
      map: "",
      reload: function () {
        dispatch("map:reload", ctrl.map.map);
      },
    };
    this.scene = {
      save: function () {
        dispatch("scene:save");
      },
    };
  })();

  gui.remember(control);

  const rendererFolder = gui.addFolder("Renderer");
  rendererFolder.add(control.renderer, "gamma");
  rendererFolder.add(control.renderer, "toneMapping", [
    "NoToneMapping",
    "LinearToneMapping",
    "ReinhardToneMapping",
    "CineonToneMapping",
    "ACESFilmicToneMapping",
  ]);
  rendererFolder.add(control.renderer, "toneMappingExposure");
  rendererFolder.addColor(control.renderer, "fogColor");

  const cameraFolder = gui.addFolder("Camera");
  cameraFolder.add(control.camera, "zoom");
  cameraFolder.add(control.camera, "fov");

  const mapFolder = gui.addFolder("Map");
  mapFolder.add(control.map, "showElevations");

  const roughnessFolder = gui.addFolder("Roughness");
  roughnessFolder.add(control.roughness, "elevations");
  roughnessFolder.add(control.roughness, "detailsElevations");
  roughnessFolder.add(control.roughness, "detailsRatio");
  roughnessFolder.add(control.roughness, "textureScale");
  roughnessFolder.add(control.roughness, "scale");
  roughnessFolder.add(control.roughness, "blur");
  roughnessFolder.add(control.roughness, "water");
  roughnessFolder.add(control.roughness, "lava");
  roughnessFolder.add(control.roughness, "twilight");
  roughnessFolder.add(control.roughness, "skipDetails");
  roughnessFolder.add(control.roughness, "onlyWalkable");
  roughnessFolder.add(control.roughness, "regenerate");

  const displacementFolder = gui.addFolder("Displacement");
  displacementFolder.add(control.displacement, "elevations");
  displacementFolder.add(control.displacement, "detailsElevations");
  displacementFolder.add(control.displacement, "detailsRatio");
  displacementFolder.add(control.displacement, "textureScale");
  displacementFolder.add(control.displacement, "scale");
  displacementFolder.add(control.displacement, "walkableLayerBlur");
  displacementFolder.add(control.displacement, "allLayersBlur");
  displacementFolder.add(control.displacement, "water");
  displacementFolder.add(control.displacement, "lava");
  displacementFolder.add(control.displacement, "twilight");
  displacementFolder.add(control.displacement, "showMap");
  displacementFolder.add(control.displacement, "regenerate");

  const emissiveFolder = gui.addFolder("Emissive");
  emissiveFolder.add(control.emissive, "elevations");
  emissiveFolder.add(control.emissive, "detailsElevations");
  emissiveFolder.add(control.emissive, "detailsRatio");
  emissiveFolder.add(control.emissive, "textureScale");
  emissiveFolder.add(control.emissive, "scale");
  emissiveFolder.add(control.emissive, "blur");
  emissiveFolder.add(control.emissive, "water");
  emissiveFolder.add(control.emissive, "lava");
  emissiveFolder.add(control.emissive, "twilight");
  emissiveFolder.add(control.emissive, "skipDetails");
  emissiveFolder.add(control.emissive, "onlyWalkable");
  emissiveFolder.add(control.emissive, "regenerate");

  const metallicFolder = gui.addFolder("Metallic");
  emissiveFolder.add(control.emissive, "elevations");
  emissiveFolder.add(control.emissive, "detailsElevations");
  metallicFolder.add(control.metallic, "detailsRatio");
  metallicFolder.add(control.metallic, "textureScale");
  metallicFolder.add(control.metallic, "scale");
  metallicFolder.add(control.metallic, "blur");
  metallicFolder.add(control.metallic, "water");
  metallicFolder.add(control.metallic, "lava");
  metallicFolder.add(control.metallic, "twilight");
  metallicFolder.add(control.metallic, "skipDetails");
  metallicFolder.add(control.metallic, "onlyWalkable");
  metallicFolder.add(control.metallic, "regenerate");

  const dirlightFolder = gui.addFolder("Directional");
  dirlightFolder.add(control.dirlight, "power");
  dirlightFolder.addColor(control.dirlight, "color");

  const pointlightFolder = gui.addFolder("Point Light");
  pointlightFolder.add(control.pointlight, "power");
  pointlightFolder.addColor(control.pointlight, "color");

  const hemilightFolder = gui.addFolder("Hemi Light");
  hemilightFolder.add(control.hemilight, "power");
  hemilightFolder.addColor(control.hemilight, "color1");
  hemilightFolder.addColor(control.hemilight, "color2");

  const spotlightFolder = gui.addFolder("Spotlights");
  spotlightFolder.add(control.spotlight, "castShadow");
  spotlightFolder.add(control.spotlight, "shadowBias");
  spotlightFolder.add(control.spotlight, "decay");
  spotlightFolder.add(control.spotlight, "distance");
  spotlightFolder.add(control.spotlight, "penumbra");
  spotlightFolder.add(control.spotlight, "reload");
  spotlightFolder.add(control.spotlight, "power");
  spotlightFolder.add(control.spotlight, "color");

  gui.show();
  return {
    control,
  };
}
