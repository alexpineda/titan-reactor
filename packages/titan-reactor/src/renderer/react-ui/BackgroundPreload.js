import React, { useEffect, useState } from "react";
import useLoadingStore, { ASSETS_MAX } from "../stores/loadingStore";

const BackgroundPreload = () => {
  const [hide, setHide] = useState(false);

  const { assetsLoaded, assetsComplete } = useLoadingStore((state) => ({
    assetsLoaded: state.assetsLoaded,
    assetsComplete: state.assetsComplete,
  }));
  const pct = ((assetsLoaded / ASSETS_MAX) * 100).toFixed(2);

  useEffect(() => {
    if (assetsComplete) {
      const _timeout = setTimeout(() => {
        setHide(true);
      }, 2000);
      return () => clearTimeout(_timeout);
    } else {
      setHide(false);
      return undefined;
    }
  }, [assetsComplete]);

  return (
    !hide && (
      <div className="absolute right-0 bottom-0 text-center m-6 z-10">
        <p className="text-gray-500">Loading Assets</p>
        <p className="text-white text-lg">{assetsComplete ? "100" : pct}%</p>
      </div>
    )
  );
};

export default BackgroundPreload;
