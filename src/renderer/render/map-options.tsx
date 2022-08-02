import { defaultGeometryOptions } from "@image/generate-map/default-geometry-options";
import { mapConfigToLeva } from "@utils/leva-utils";
import { GeometryOptions } from "common/types";
import { LevaPanel, useControls, useCreateStore } from "leva";
import { useState } from "react";

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
};

export const MapViewer = ({
  onChange,
  onDisplayOptionsChange,
  defaultDisplayOptions,
}: {
  onChange: (options: GeometryOptions) => void;
  onDisplayOptionsChange: (options: MapDisplayOptions) => void;
  defaultDisplayOptions: MapDisplayOptions;
}) => {
  const store = useCreateStore();
  const [displayOptions, setDisplayOptions] = useState<MapDisplayOptions>(
    defaultDisplayOptions
  );

  const updateDisplayOptions = (newOptions: Partial<MapDisplayOptions>) => {
    const n = { ...displayOptions, ...newOptions };
    setDisplayOptions(n);
    onDisplayOptionsChange(n);
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

  return <LevaPanel store={store} />;
};
