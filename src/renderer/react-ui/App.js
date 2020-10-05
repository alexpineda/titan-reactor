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

const MinimapCanvas = memo(() => (
  <div
    id="minimap"
    style={{
      position: "absolute",
      left: "0",
      bottom: "0",
      height: "300px",
      width: "300px",
    }}
  ></div>
));

export const App = ({ loadingOverlay, canvas, children }) => (
  <>
    {loadingOverlay}
    {children}
    <MinimapCanvas />
    <RenderingCanvas canvas={canvas} />
  </>
);
