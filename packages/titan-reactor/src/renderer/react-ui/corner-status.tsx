import React from "react";
import shallow from "zustand/shallow";
import {
  useLoadingStore,
  LoadingStoreProcess,
  LoadingStoreDeterminateProcess,
} from "../stores";

const Process = ({ label, pct }: { label: string; pct: string | null }) => (
  <div className="absolute right-0 bottom-0 text-center  z-50">
    <div className="relative m-12">
      <p className="text-gray-500 glitch glitch-slow" data-text={label}>
        {label}
      </p>
      {pct && <p className="text-white text-lg">{pct}%</p>}
    </div>
  </div>
);

function isDeterminate(
  partner: any
): partner is LoadingStoreDeterminateProcess {
  return "max" in partner;
}

const CornerStatus = () => {
  const processes = useLoadingStore((state) => state.processes, shallow);

  if (processes.length === 0) {
    return null;
  }

  const process = processes.reduce(
    (max, p) => (p.priority > max.priority ? p : max),
    { priority: -1 } as LoadingStoreProcess
  );
  if (!process.id) {
    return null;
  }
  const pct = isDeterminate(process)
    ? ((Math.min(process.current, process.max) / process.max) * 100).toFixed(2)
    : null;

  return <Process label={process.label} pct={pct} />;
};

export default CornerStatus;
