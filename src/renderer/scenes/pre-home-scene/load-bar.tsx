import { useProcessStore } from "@stores/process-store";

interface LoadBarProps {
  color: string;
  thickness: number;
  style?: any;
}

export const LoadBar = ({ color, thickness, style }: LoadBarProps) => {
  const progress = useProcessStore((state) => state.getTotalProgress());
  return (
    <div
      style={{
        background: color,
        transform: `scaleX(${progress})`,
        height: `${thickness}px`,
        width: "100%",
        ...style,
      }}
    >
      &nbsp;
    </div>
  );
};
