import React, { useEffect, useRef } from "react";

export const WrappedCanvas = ({
  canvas,
  className = "",
  style = {},
  ...props
}: {
  canvas: HTMLCanvasElement;
  className?: string;
  style?: React.CSSProperties;
}) => {
  const canvasRef = useRef<HTMLDivElement>();
  useEffect(() => {
    if (!canvasRef.current) return;
    canvasRef.current.appendChild(canvas);
    return () => {
      canvas.remove();
    };
  }, []);
  return (
    <div className={className} ref={canvasRef} style={style} {...props}></div>
  );
};
