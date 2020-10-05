import React, { memo, useRef, useEffect } from "react";
import "./css/tailwind.min.css";
import "./css/pattern.min.css";
import "./css/icon.css";

const RenderingCanvas = ({ canvas }) => {
  const canvasRef = useRef();
  useEffect(() => {
    canvasRef.current.appendChild(canvas);
  }, []);
  return <div ref={canvasRef}></div>;
};

export const App = ({ loadingOverlay, canvas, children }) => (
  <>
    <RenderingCanvas canvas={canvas} />
    {loadingOverlay}
    {children}
  </>
);
