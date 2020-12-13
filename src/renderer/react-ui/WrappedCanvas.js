import React, { useEffect, useRef } from "react";

const WrappedCanvas = ({ canvas, className = "", style = {} }) => {
  const canvasRef = useRef();
  useEffect(() => {
    canvasRef.current.appendChild(canvas);
  }, []);
  return <div className={className} ref={canvasRef} style={style}></div>;
};

export default WrappedCanvas;
