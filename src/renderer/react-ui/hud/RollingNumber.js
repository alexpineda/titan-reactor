import React, { useEffect, useState } from "react";

export const RollingNumber = ({ number, upSpeed = 80, downSpeed = 40 }) => {
  const [currNumber, setCurrNumber] = useState(0);

  useEffect(() => {
    if (currNumber === number) {
      return;
    }

    const up = number > currNumber;
    const speed = up ? upSpeed : downSpeed;
    const id = setTimeout(() => {
      if (up) {
        setCurrNumber(currNumber + 1);
      } else {
        setCurrNumber(currNumber - 1);
      }
    }, speed);

    return () => clearTimeout(id);
  }, [number, currNumber]);

  return <>{currNumber}</>;
};
