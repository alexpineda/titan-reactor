import * as dat from "dat.gui";
import Stats from "stats.js";
import { renderOptions, addRendererFields } from "./renderer";
import { render } from "react-dom";

export function createStats() {
  const stats = new Stats();
  stats.showPanel(0);
  document.body.appendChild(stats.dom);
  return stats;
}

export function createGui(onlyTextures = false) {
  const gui = new dat.GUI();
  const listeners = {};

  const on = function (eventName, handler) {
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

  let control = new (function () {
    const ctrl = this;
    this.on = on;

    this.state = {
      tileset: "Jungle",
      save: function () {
        localStorage.setItem(this.tileset, JSON.stringify(ctrl));
      },
      load: function () {
        const json = JSON.parse(localStorage.getItem(this.tileset));

        for (const [key, value] of Object.entries(json)) {
          Object.assign(ctrl[key], value);
        }

        gui.updateDisplay();
        return ctrl;
      },
    };

    this.renderer = renderOptions();

    this.camera = {
      zoom: 1,
      fov: 75,
      near: 0.1,
      far: 1000,
    };

    this.roughness = {
      elevations: "1 1 1 1 1 1 1",
      detailsRatio: "0.5 0 0 0 0 0 0",
      textureScale: 0.5,
      effectScale: 1,
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
      detailsRatio: "0.15, 0.15, 0.075, 0.15, 0.15, 0.075, 0",
      textureScale: 0.25,
      effectScale: 6,
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
      detailsRatio: "0.5 0 0 0 0 0 0",
      textureScale: 0.5,
      effectScale: 1,
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
      detailsRatio: "0.5 0 0 0 0 0 0",
      textureScale: 0.5,
      effectScale: 1,
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
      power: 3,
      color: "#ffffff",
      x: -40,
      y: 20,
      z: -60,
    };

    this.hemilight = {
      power: 3,
      color1: "#ffffff",
      color2: "#ffffff",
    };

    this.spotlight = {
      positionY: 50,
      positionX: 80,
      positionZ: 80,
      castShadow: true,
      shadowBias: -0.0001,
      decay: 3.7,
      distance: 100,
      penumbra: 0.5,
      power: 0,
      color: "#ffa95c",
      reload: function () {
        console.log("dispatch:spotlight");
        dispatch("spotlight");
      },
    };

    this.map = {
      showElevations: false,
      showWireframe: false,
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

  const stateFolder = gui.addFolder("State");
  stateFolder.add(control.state, "tileset", [
    "Badlands",
    "Space",
    "Installation",
    "Ashworld",
    "Jungle",
    "Desert",
    "Ice",
    "Twilight",
  ]);
  stateFolder.add(control.state, "save");
  stateFolder.add(control.state, "load");

  if (!onlyTextures) {
    const sceneFolder = gui.addFolder("Scene");

    const folder = sceneFolder.addFolder("Renderer");
    addRendererFields(
      folder.add.bind(folder, control.renderer),
      folder.addColor.bind(folder, control.renderer)
    );

    const cameraFolder = sceneFolder.addFolder("Camera");
    cameraFolder.add(control.camera, "zoom");
    cameraFolder.add(control.camera, "fov");

    const mapFolder = sceneFolder.addFolder("Map");
    mapFolder.add(control.map, "showElevations");
    mapFolder.add(control.map, "showWireframe");

    const dirlightFolder = sceneFolder.addFolder("Directional");
    dirlightFolder.add(control.dirlight, "power");
    dirlightFolder.addColor(control.dirlight, "color");
    dirlightFolder.add(control.dirlight, "x");
    dirlightFolder.add(control.dirlight, "y");
    dirlightFolder.add(control.dirlight, "z");

    const pointlightFolder = sceneFolder.addFolder("Point Light");
    pointlightFolder.add(control.pointlight, "power");
    pointlightFolder.addColor(control.pointlight, "color");

    const hemilightFolder = sceneFolder.addFolder("Hemi Light");
    hemilightFolder.add(control.hemilight, "power");
    hemilightFolder.addColor(control.hemilight, "color1");
    hemilightFolder.addColor(control.hemilight, "color2");

    const spotlightFolder = sceneFolder.addFolder("Spotlights");
    spotlightFolder.add(control.spotlight, "castShadow");
    spotlightFolder.add(control.spotlight, "shadowBias");
    spotlightFolder.add(control.spotlight, "decay");
    spotlightFolder.add(control.spotlight, "distance");
    spotlightFolder.add(control.spotlight, "penumbra");
    spotlightFolder.add(control.spotlight, "reload");
    spotlightFolder.add(control.spotlight, "power");
    spotlightFolder.add(control.spotlight, "color");
  }
  const texturesFolder = gui.addFolder("Textures");

  const roughnessFolder = texturesFolder.addFolder("Roughness");
  const roughPre = roughnessFolder.addFolder("Pre");
  const roughProcess = roughnessFolder.addFolder("Process");
  const roughPost = roughnessFolder.addFolder("Post");

  roughProcess.add(control.roughness, "elevations");
  roughProcess.add(control.roughness, "detailsRatio");
  roughPre.add(control.roughness, "textureScale");
  roughPost.add(control.roughness, "effectScale");
  roughPost.add(control.roughness, "blur");
  roughProcess.add(control.roughness, "water");
  roughProcess.add(control.roughness, "lava");
  roughProcess.add(control.roughness, "twilight");
  roughProcess.add(control.roughness, "skipDetails");
  roughProcess.add(control.roughness, "onlyWalkable");
  roughnessFolder.add(control.roughness, "regenerate");

  const displacementFolder = texturesFolder.addFolder("Displacement");
  const displacePre = displacementFolder.addFolder("Pre");
  const displaceProcess = displacementFolder.addFolder("Process");
  const displacePost = displacementFolder.addFolder("Post");
  displacementFolder.add(control.displacement, "showMap");
  displacePre.add(control.displacement, "textureScale");
  displacePost.add(control.displacement, "effectScale");
  displacePost.add(control.displacement, "walkableLayerBlur");
  displacePost.add(control.displacement, "allLayersBlur");

  displaceProcess.add(control.displacement, "elevations");
  displaceProcess.add(control.displacement, "detailsRatio");
  displaceProcess.add(control.displacement, "water");
  displaceProcess.add(control.displacement, "lava");
  displaceProcess.add(control.displacement, "twilight");

  displacementFolder.add(control.displacement, "regenerate");

  const emissiveFolder = texturesFolder.addFolder("Emissive");
  const emissivePre = emissiveFolder.addFolder("Pre");
  const emissiveProcess = emissiveFolder.addFolder("Process");
  const emissivePost = emissiveFolder.addFolder("Post");

  emissiveProcess.add(control.emissive, "elevations");
  emissiveProcess.add(control.emissive, "detailsRatio");
  emissivePre.add(control.emissive, "textureScale");
  emissivePost.add(control.emissive, "effectScale");
  emissivePost.add(control.emissive, "blur");
  emissiveProcess.add(control.emissive, "water");
  emissiveProcess.add(control.emissive, "lava");
  emissiveProcess.add(control.emissive, "twilight");
  emissiveProcess.add(control.emissive, "skipDetails");
  emissiveProcess.add(control.emissive, "onlyWalkable");
  emissiveFolder.add(control.emissive, "regenerate");

  const metallicFolder = texturesFolder.addFolder("Metallic");
  const metallicPre = metallicFolder.addFolder("Pre");
  const metallicProcess = metallicFolder.addFolder("Process");
  const metallicPost = metallicFolder.addFolder("Post");

  metallicProcess.add(control.emissive, "elevations");
  metallicProcess.add(control.metallic, "detailsRatio");
  metallicPre.add(control.metallic, "textureScale");
  metallicPost.add(control.metallic, "effectScale");
  metallicPost.add(control.metallic, "blur");
  metallicProcess.add(control.metallic, "water");
  metallicProcess.add(control.metallic, "lava");
  metallicProcess.add(control.metallic, "twilight");
  metallicProcess.add(control.metallic, "skipDetails");
  metallicProcess.add(control.metallic, "onlyWalkable");
  metallicFolder.add(control.metallic, "regenerate");

  gui.show();
  return {
    control,
  };
}
