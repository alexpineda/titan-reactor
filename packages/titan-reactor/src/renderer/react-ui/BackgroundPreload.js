import React from "react";
import useLoadingStore, {
  ASSETS_MAX,
  MAP_GENERATION_MAX,
} from "../stores/loadingStore";
import shallow from "zustand/shallow";

const BackgroundPreload = () => {
  const {
    assetsLoaded,
    assetsComplete,
    mapGenerationComplete,
    mapGenerationProgress,
  } = useLoadingStore(
    (state) => ({
      assetsLoaded: state.assetsLoaded,
      assetsComplete: state.assetsComplete,
      mapGenerationComplete: state.mapGenerationComplete,
      mapGenerationProgress: state.mapGenerationProgress,
    }),
    shallow
  );

  const pct = mapGenerationProgress
    ? ((mapGenerationProgress / MAP_GENERATION_MAX) * 100).toFixed(2)
    : ((assetsLoaded / ASSETS_MAX) * 100).toFixed(2);
  const isComplete =
    assetsComplete && (mapGenerationComplete || mapGenerationProgress === 0);

  const label = mapGenerationProgress ? "Generating Map" : "Loading Assets";

  return (
    !isComplete && (
      <div className="absolute right-0 bottom-0 text-center m-6 z-50">
        <p className="text-gray-500">{label}</p>
        <p className="text-white text-lg">{pct}%</p>
      </div>
    )
  );
};

export default BackgroundPreload;
