import React, { useEffect, useRef } from "react";

export const WrappedCanvas = ({ canvas, className = "" }) => {
  const canvasRef = useRef();
  useEffect(() => {
    canvasRef.current.appendChild(canvas);
  }, []);
  return <div className={className} ref={canvasRef}></div>;
};
