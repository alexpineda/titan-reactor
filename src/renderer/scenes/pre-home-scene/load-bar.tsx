import { useProcessStore } from "@stores/process-store";
import { useEffect, useRef } from "react";

interface LoadBarProps {
  color: string;
  thickness: number;
  style?: any;
}

export const LoadBar = ({ color, thickness, style }: LoadBarProps) => {
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return useProcessStore.subscribe((store) => {
      if (!divRef.current) return;
      divRef.current.style.transform = `scaleX(${store.getTotalProgress()})`;
    });
  }, []);

  return (
    <div
      ref={divRef}
      style={{
        background: color,
        height: `${thickness}px`,
        width: "100%",
        ...style,
      }}
    >
      &nbsp;
    </div>
  );
};
