import {
  BloomEffect,
  DepthOfFieldEffect,
  EffectPass,
  RenderPass,
  ToneMappingEffect,
  ToneMappingMode,
  ScanlineEffect
}
  from "postprocessing";

import {
  Camera,
  PerspectiveCamera,
  Scene,
} from "three";

import FogOfWarEffect from "../fogofwar/fog-of-war-effect";

export enum Passes {
  Render,
  Regular,
  Bloom,
  Cinematic,
  CinematicWithAA,
  SMAA,
};

export enum Effects {
  DepthOfField,
  SMAA,
  FogOfWar,
  Bloom,
};

//https://github.com/vanruesc/postprocessing/wiki/Skinned-and-Instanced-Meshes
// OverrideMaterialManager.workaroundEnabled = true;

export const createPasses = () => {

  const throwAwayCamera = new PerspectiveCamera();
  const effects: any[] = [];
  const passes: any[] = [];


  const dofEffect = effects[Effects.DepthOfField] = new DepthOfFieldEffect(throwAwayCamera, {
    focusDistance: 0.01,
    focalLength: 0.01,
    bokehScale: 1.0,
    height: 480,
  });

  const fogEffect = effects[Effects.FogOfWar] = new FogOfWarEffect();
  const toneMapping = new ToneMappingEffect({ mode: ToneMappingMode.ACES_FILMIC });
  const toneMappingCinema = new ToneMappingEffect({ mode: ToneMappingMode.OPTIMIZED_CINEON });

  const bloomEffect = effects[Effects.Bloom] = new BloomEffect({
    luminanceThreshold: 0.9,
  });

  const scanlineEffect = new ScanlineEffect({ density: 0.75 });
  scanlineEffect.blendMode.opacity.value = 0.2

  passes[Passes.Render] = new RenderPass(throwAwayCamera);
  passes[Passes.Cinematic] = new EffectPass(
    throwAwayCamera,
    dofEffect,
    fogEffect,
    scanlineEffect,
    toneMappingCinema
  );
  passes[Passes.Bloom] = new EffectPass(throwAwayCamera, bloomEffect);
  passes[Passes.Regular] = new EffectPass(throwAwayCamera, fogEffect, toneMapping);

  const enable = (...whichOnes: Passes[]) => {
    let i = 0;
    let lastPass: any = null;
    for (const pass of passes) {
      if (pass === undefined) continue;
      pass.enabled = false;
      pass.renderToScreen = false;
      if (whichOnes.includes(i)) {
        pass.enabled = true;
        lastPass = pass;
      }
      i++;
    }
    lastPass.renderToScreen = true;
  };

  return {

    passes,
    effects,

    presetRegularCam() {
      fogEffect.blendMode.opacity.value = 1;
      enable(Passes.Render, Passes.Regular);
    },

    presetBattleCam() {
      fogEffect.blendMode.opacity.value = 1;
      enable(Passes.Render, Passes.Cinematic);
    },

    presetOverviewCam() {
      fogEffect.blendMode.opacity.value = 0.7;
      enable(Passes.Render, Passes.Regular);
    },

    enable,
    update: (scene: Scene, camera: Camera) => {
      effects[Effects.DepthOfField].camera = camera;
      passes[Passes.Render].camera = camera;
      passes[Passes.Bloom].camera = camera;
      passes[Passes.Cinematic].camera = camera;
      passes[Passes.Regular].camera = camera;
      passes[Passes.Render].scene = scene;
    },

  }
};