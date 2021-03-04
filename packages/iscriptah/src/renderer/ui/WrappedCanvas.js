import React, { useEffect, useRef } from "react";

export const WrappedCanvas = ({
  canvas,
  className = "",
  style = {},
  ...props
}) => {
  const canvasRef = useRef();
  useEffect(() => {
    canvasRef.current.appendChild(canvas);
    return () => {
      canvasRef.current.remove(canvas);
    };
  }, []);
  return (
    <div className={className} ref={canvasRef} style={style} {...props}></div>
  );
};
