import {
  // @ts-ignore
  BloomEffect,
  // @ts-ignore
  DepthOfFieldEffect,
  // @ts-ignore
  EdgeDetectionMode,
  // @ts-ignore
  EffectPass,
  // @ts-ignore
  OverrideMaterialManager,
  // @ts-ignore
  RenderPass,
  // @ts-ignore
  SMAAEffect,
  // @ts-ignore
  SMAAImageLoader,
  // @ts-ignore
  SMAAPreset,
  // @ts-ignore
  ToneMappingEffect,
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
  Bloom,
  Cinematic,
  CinematicWithAA,
  SMAA
};

export enum Effects {
  DepthOfField,
  SMAA,
  FogOfWar,
  ToneMapping,
  Bloom
};

//https://github.com/vanruesc/postprocessing/wiki/Skinned-and-Instanced-Meshes
OverrideMaterialManager.workaroundEnabled = true;

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

  // const onPassesReady = new Promise((resolve) => {
  //   new SMAAImageLoader().load(
  //     ([searchImage, areaImage]: [any, any]) => {
  //       const smaaEffect = effects[Effects.SMAA] = new SMAAEffect(
  //         searchImage,
  //         areaImage,
  //         SMAAPreset.LOW,
  //         EdgeDetectionMode.DEPTH
  //       );
  //       passes[Passes.SMAA] = new EffectPass(throwAwayCamera, smaaEffect);
  //       passes[Passes.CinematicWithAA] = new EffectPass(
  //         throwAwayCamera,
  //         dofEffect,
  //         fowEffect,
  //         smaaEffect,
  //       );
  //       resolve(passes);
  //     }
  //   );
  // });





  const fowEffect = effects[Effects.FogOfWar] = new FogOfWarEffect();
  const toneMapping = effects[Effects.ToneMapping] = new ToneMappingEffect();
  const bloomEffect = effects[Effects.Bloom] = new BloomEffect({
    luminanceThreshold: 0.9,
  });


  passes[Passes.Render] = new RenderPass(throwAwayCamera);
  passes[Passes.Bloom] = new EffectPass(throwAwayCamera, bloomEffect);
  passes[Passes.Cinematic] = new EffectPass(
    throwAwayCamera,
    dofEffect,
    fowEffect,
  );


  return {

    passes,
    effects,
    // onPassesReady,

    togglePasses: (...whichOnes: Passes[]) => {
      let i = 0;
      let lastPass: any = null;
      for (const pass of passes) {
        pass.enabled = false;
        pass.renderToScreen = false;
        if (whichOnes.includes(i)) {
          pass.enabled = true;
          lastPass = pass;
        }
        i++;
      }
      lastPass.renderToScreen = true;
    },

    update: (scene: Scene, camera: Camera) => {
      effects[Effects.DepthOfField].camera = camera;
      passes[Passes.Render].camera = camera;
      passes[Passes.Bloom].camera = camera;
      passes[Passes.Cinematic].camera = camera;
      // passes[Passes.CinematicWithAA].camera = camera;
      // passes[Passes.SMAA].camera = camera;
      passes[Passes.Render].scene = scene;
    },

  }
};