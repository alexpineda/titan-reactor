import React from "react";

export default ({ image, dimensions }) => {
  const className = dimensions.width < 1500 ? "w-6 w-6" : "w-8 h-8";

  return (
    <img
      src={image}
      className={`inline ${className}`}
      style={{
        filter: "brightness(1.5)",
        mixBlendMode: "luminosity",
      }}
    />
  );
};
