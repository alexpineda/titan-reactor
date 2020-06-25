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
      toneMapping: [],
      toneMappingExposure: 1,
    };

    this.camera = {
      x: 0,
      y: 0,
      z: 0,
      zoom: 1,
      fov: 75,
      near: 1,
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
      elevations: "1 1 1 1 1 1 1",
      detailsElevations: "1 0 0 0 0 0 0",
      detailsRatio: "0.5 0 0 0 0 0 0",
      textureScale: 0.5,
      scale: 6,
      blur: 0,
      water: false,
      lava: false,
      twilight: false,
      skipDetails: false,
      onlyWalkable: false,
      regenerate: function () {
        console.log("dispatch:displacement");
        dispatch("displacement", ctrl.roughness);
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
        console.log("dispatch:displacement");
        dispatch("displacement", ctrl.roughness);
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
        console.log("dispatch:displacement");
        dispatch("displacement", ctrl.roughness);
      },
    };

    this.map = {
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
  displacementFolder.add(control.displacement, "blur");
  displacementFolder.add(control.displacement, "water");
  displacementFolder.add(control.displacement, "lava");
  displacementFolder.add(control.displacement, "twilight");
  displacementFolder.add(control.displacement, "skipDetails");
  displacementFolder.add(control.displacement, "onlyWalkable");
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

  const lightsFolder = gui.addFolder("Lights");

  const spotlightFolder = gui.addFolder("Spotlights");

  // emissiveFolder.add(control.emissive, "elevations");
  // emissiveFolder.add(control.emissive, "detailsElevations");

  gui.show();
  return control;
}
