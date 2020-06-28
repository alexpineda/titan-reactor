import React, { useCallback } from "react";

//16x16
export function Palette({ colors = [] }) {
  const canvasRef = useCallback(
    (canvas) => {
      const ctx = canvas.getContext("2d");
      colors.map(([r, g, b], i) => {
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect((i % 16) * 5, Math.floor(i / 16) * 5, 5, 5);
      });
    },
    [colors.length]
  );

  return colors.length ? (
    <canvas ref={canvasRef} width="80px" height="80px"></canvas>
  ) : (
    <p>Drop WPE here</p>
  );
}
