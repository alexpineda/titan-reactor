import React from "react";

export default ({ image, dimensions }) => {
  const style =
    dimensions.width < 1500
      ? {
          width: "1.75rem",
          height: "1.75rem",
        }
      : {
          width: "1.25rem",
          height: "1.25rem",
        };

  return <img src={image} className="inline" style={style} />;
};
