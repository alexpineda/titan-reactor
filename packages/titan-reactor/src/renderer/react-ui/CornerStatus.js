import React from "react";
import shallow from "zustand/shallow";

import useLoadingStore from "../stores/loadingStore";

const CornerStatus = () => {
  const processes = useLoadingStore((state) => state.processes, shallow);

  if (processes.length === 0) {
    return null;
  }

  const process = processes.reduce(
    (max, p) => (p.priority > max.priority ? p : max),
    { priority: -1 }
  );
  if (!process.id) {
    return null;
  }
  const pct = (
    (Math.min(process.current, process.max) / process.max) *
    100
  ).toFixed(2);

  return (
    <div className="absolute right-0 bottom-0 text-center  z-50">
      <div className="relative m-12">
        <p
          className="text-gray-500 glitch glitch-slow"
          data-text={process.label}
        >
          {process.label}
        </p>
        {process.mode === "determinate" && (
          <p className="text-white text-lg">{pct}%</p>
        )}
      </div>
    </div>
  );
};

export default CornerStatus;
