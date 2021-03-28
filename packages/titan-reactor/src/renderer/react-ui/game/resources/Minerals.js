import React from "react";

export default ({ image, dimensions }) => {
  const className = dimensions.width < 1500 ? "w-4 w-4" : "w-6 w-6";
  return (
    <img
      src={image}
      className={`inline ${className}`}
      style={{
        filter: "contrast(0.5) saturate(2) brightness(1.2)",
        mixBlendMode: "hard-light",
      }}
    />
  );
};
