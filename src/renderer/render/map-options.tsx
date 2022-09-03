import { defaultGeometryOptions } from "@image/generate-map/default-geometry-options";
import { mapConfigToLeva } from "@utils/leva-utils";
import { GeometryOptions } from "common/types";
import { LevaPanel, useControls, useCreateStore } from "leva";
import { useState } from "react";
import { Vector3 } from "three";
import BaseScene from "./base-scene";

export const createUpdateDisplayOptions =
  (scene: BaseScene) => (options: MapDisplayOptions) => {
    console.log(options);
    scene.terrain.children.forEach((c) => {
      c.material.wireframe = options.wireframe;
    });

    scene.sunlight.position.copy(options.sunPosition);
    scene.sunlight.intensity = options.sunIntensity;
    scene.sunlight.color.set(options.sunColor);
    scene.sunlight.shadow.needsUpdate = true;
  };

const toSimple = (obj: { [key: string]: { value: any } }) => {
  const result: GeometryOptions = defaultGeometryOptions;
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      // @ts-ignore
      if (Array.isArray(result[key])) {
        const k = key.split("_");
        // @ts-ignore
        result[k[1]][k[0]] = obj[key].value;
      } else {
        // @ts-ignore
        result[key] = obj[key].value;
      }
    }
  }
  return result;
};

export type MapDisplayOptions = {
  wireframe: boolean;
  skybox: boolean;
  sunPosition: Vector3;
  sunColor: string;
  sunIntensity: number;
};

export const MapViewer = ({
  onChange,
  onDisplayOptionsChange,
  displayOptions,
}: {
  onChange: (options: GeometryOptions) => void;
  onDisplayOptionsChange: (options: MapDisplayOptions) => void;
  displayOptions: MapDisplayOptions;
}) => {
  const store = useCreateStore();
  // const [displayOptions, setDisplayOptions] = useState<MapDisplayOptions>(
  //   defaultDisplayOptions
  // );

  const updateDisplayOptions = (newOptions: Partial<MapDisplayOptions>) => {
    Object.assign(displayOptions, newOptions);
    // setDisplayOptions(n);
    onDisplayOptionsChange(displayOptions);
  };

  const [state, setState] = useState({
    "0_elevationLevels": {
      folder: "Elevation Levels",
      value: defaultGeometryOptions.elevationLevels[0],
      step: 0.05,
    },
    "1_elevationLevels": {
      folder: "Elevation Levels",
      value: defaultGeometryOptions.elevationLevels[1],
      step: 0.05,
    },
    "2_elevationLevels": {
      folder: "Elevation Levels",
      value: defaultGeometryOptions.elevationLevels[2],
      step: 0.05,
    },
    "3_elevationLevels": {
      folder: "Elevation Levels",
      value: defaultGeometryOptions.elevationLevels[3],
      step: 0.05,
    },
    "4_elevationLevels": {
      folder: "Elevation Levels",
      value: defaultGeometryOptions.elevationLevels[4],
      step: 0.05,
    },
    "5_elevationLevels": {
      folder: "Elevation Levels",
      value: defaultGeometryOptions.elevationLevels[5],
      step: 0.05,
    },
    "6_elevationLevels": {
      folder: "Elevation Levels",
      value: defaultGeometryOptions.elevationLevels[6],
      step: 0.05,
    },
    "0_ignoreLevels": {
      folder: "Ignore Levels",
      value: defaultGeometryOptions.ignoreLevels[0],
    },
    "1_ignoreLevels": {
      folder: "Ignore Levels",
      value: defaultGeometryOptions.ignoreLevels[1],
    },
    "2_ignoreLevels": {
      folder: "Ignore Levels",
      value: defaultGeometryOptions.ignoreLevels[2],
    },
    "3_ignoreLevels": {
      folder: "Ignore Levels",
      value: defaultGeometryOptions.ignoreLevels[3],
    },
    "4_ignoreLevels": {
      folder: "Ignore Levels",
      value: defaultGeometryOptions.ignoreLevels[4],
    },
    "5_ignoreLevels": {
      folder: "Ignore Levels",
      value: defaultGeometryOptions.ignoreLevels[5],
    },
    "6_ignoreLevels": {
      folder: "Ignore Levels",
      value: defaultGeometryOptions.ignoreLevels[6],
    },

    textureDetail: {
      folder: "Generation",
      value: defaultGeometryOptions.textureDetail,
      min: 1,
      max: 32,
      step: 1,
    },
    meshDetail: {
      folder: "Generation",
      value: defaultGeometryOptions.meshDetail,
      min: 0.5,
      max: 4,
      step: 0.5,
    },
    maxTerrainHeight: {
      folder: "Generation",
      value: defaultGeometryOptions.maxTerrainHeight,
    },
    detailsMix: {
      folder: "Generation",
      value: defaultGeometryOptions.detailsMix,
    },
    bumpScale: {
      folder: "Generation",
      value: defaultGeometryOptions.bumpScale,
    },
    blendNonWalkableBase: {
      folder: "Generation",
      value: defaultGeometryOptions.blendNonWalkableBase,
    },
    firstPass: {
      folder: "Generation",
      value: defaultGeometryOptions.firstPass,
    },
    secondPass: {
      folder: "Generation",
      value: defaultGeometryOptions.secondPass,
    },
    processWater: {
      folder: "Generation",
      value: defaultGeometryOptions.processWater,
    },
    normalizeLevels: {
      folder: "Generation",
      value: defaultGeometryOptions.normalizeLevels,
    },
    wireframe: {
      folder: "Display",
      value: displayOptions.wireframe,
      onChange: (value: boolean) => {
        updateDisplayOptions({ wireframe: value });
      },
    },
    skybox: {
      folder: "Display",
      value: displayOptions.skybox,
      onChange: (value: boolean) => {
        updateDisplayOptions({ skybox: value });
      },
    },
    sunPosition: {
      folder: "Lighting",
      value: displayOptions.sunPosition,
      step: 1,
      onChange: (value: Vector3) => {
        updateDisplayOptions({ sunPosition: value });
      },
    },
    sunColor: {
      folder: "Lighting",
      value: displayOptions.sunColor,
      onChange: (value: string) => {
        updateDisplayOptions({ sunColor: value });
      },
    },
    sunIntensity: {
      folder: "Lighting",
      value: displayOptions.sunIntensity,
      step: 0.5,
      onChange: (value: number) => {
        updateDisplayOptions({ sunIntensity: value });
      },
    },
  });
  const controls = mapConfigToLeva(
    state,
    (value: any, key?: string) => {
      //@ts-ignore
      setState((state) => ({ ...state, [key!]: { ...state[key!], value } }));
      onChange(toSimple(state));
    },
    false
  );
  for (const [folder, config] of controls) {
    useControls(folder, config, { store, collapsed: true });
  }

  // if (high && walkable && mid) {
  //   elevation = 6;
  // } else if (high && walkable) {
  //   elevation = 5;
  // } else if (high) {
  //   elevation = 4;
  // } else if (mid && walkable) {
  //   elevation = 3;
  // } else if (mid) {
  //   elevation = 2;
  // } else if (walkable) {
  //   elevation = 1;
  // }

  return (
    <>
      <LevaPanel store={store} />
      <div
        style={{
          padding: "2rem",
          display: "flex",
          flexDirection: "column",
          position: "absolute",
          left: "0",
          bottom: "0",
        }}
      >
        <table>
          <tbody>
            <tr>
              <td>High Mid Walkable</td>
            </tr>
            <tr>
              <td>High Walkable</td>
            </tr>
            <tr>
              <td>High</td>
            </tr>
            <tr>
              <td>Mid Walkable</td>
            </tr>
            <tr>
              <td>Mid</td>
            </tr>
            <tr>
              <td>Low Walkable</td>
            </tr>
            <tr>
              <td>Low</td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
};
