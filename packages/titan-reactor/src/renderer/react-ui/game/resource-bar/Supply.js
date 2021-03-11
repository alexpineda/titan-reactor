import React from "react";

export default ({ image, dimensions }) => {
  const className = dimensions.width < 1500 ? "w-4 w-4" : "w-6 w-6";
  return (
    <img
      src={image}
      className={`inline ${className}`}
      style={{
        filter: "grayscale(0.5) contrast(0.5) brightness(1.35)",
        mixBlendMode: "hard-light",
        transform: "scale(1.2)",
      }}
    />
  );
};
