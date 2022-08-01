import { defaultGeometryOptions } from "@image/generate-map/default-geometry-options";
import { mapConfigToLeva } from "@utils/leva-utils";
import { GeometryOptions } from "common/types";
import { LevaPanel, useControls, useCreateStore } from "leva";
import { useState } from "react";

const toSimple = (obj: { [key: string]: { value: any } }) => {
  const result: GeometryOptions = defaultGeometryOptions;
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (Array.isArray(result[key])) {
        const k = key.split("_");
        result[k[0]][k[1]] = obj[key].value;
      } else {
        result[key] = obj[key].value;
      }
    }
  }
  return result;
};

export const MapViewer = ({
  onChange,
}: {
  onChange: (options: GeometryOptions) => void;
}) => {
  const store = useCreateStore();
  const [state, setState] = useState({
    elevationLevels_0: {
      folder: "Elevation Levels",
      value: defaultGeometryOptions.elevationLevels[0],
      step: 0.05,
    },
    elevationLevels_1: {
      folder: "Elevation Levels",
      value: defaultGeometryOptions.elevationLevels[1],
      step: 0.05,
    },
    elevationLevels_2: {
      folder: "Elevation Levels",
      value: defaultGeometryOptions.elevationLevels[2],
      step: 0.05,
    },
    elevationLevels_3: {
      folder: "Elevation Levels",
      value: defaultGeometryOptions.elevationLevels[3],
      step: 0.05,
    },
    elevationLevels_4: {
      folder: "Elevation Levels",
      value: defaultGeometryOptions.elevationLevels[4],
      step: 0.05,
    },
    elevationLevels_5: {
      folder: "Elevation Levels",
      value: defaultGeometryOptions.elevationLevels[5],
      step: 0.05,
    },
    elevationLevels_6: {
      folder: "Elevation Levels",
      value: defaultGeometryOptions.elevationLevels[6],
      step: 0.05,
    },
    ignoreLevels_0: {
      folder: "Ignore Levels",
      value: defaultGeometryOptions.ignoreLevels[0],
    },
    ignoreLevels_1: {
      folder: "Ignore Levels",
      value: defaultGeometryOptions.ignoreLevels[1],
    },
    ignoreLevels_2: {
      folder: "Ignore Levels",
      value: defaultGeometryOptions.ignoreLevels[2],
    },
    ignoreLevels_3: {
      folder: "Ignore Levels",
      value: defaultGeometryOptions.ignoreLevels[3],
    },
    ignoreLevels_4: {
      folder: "Ignore Levels",
      value: defaultGeometryOptions.ignoreLevels[4],
    },
    ignoreLevels_5: {
      folder: "Ignore Levels",
      value: defaultGeometryOptions.ignoreLevels[5],
    },
    ignoreLevels_6: {
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
  });
  const controls = mapConfigToLeva(state, (value: any, key?: string) => {
    //@ts-ignore
    setState((state) => ({ ...state, [key!]: { ...state[key!], value } }));
    onChange(toSimple(state));
  });
  for (const [folder, config] of controls) {
    useControls(folder, config, { store });
  }

  return <LevaPanel store={store} />;
};
