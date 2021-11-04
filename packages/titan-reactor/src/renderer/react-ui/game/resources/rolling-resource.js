import React, { useEffect, useRef } from "react";
import { useResourcesStore } from "../../../stores";
import RollingNumber from "./rolling-number";

const RollingResource = ({ image, scaledTextSize, selector }) => {
  const numberRef = useRef();

  useEffect(() => {
    const rollingNumber = new RollingNumber(
      selector(useResourcesStore.getState())
    );

    if (numberRef.current) {
      numberRef.current.textContent = rollingNumber.rollingValue;
    }
    let lastTime = 0;
    let animFrame;

    const rafLoop = (time) => {
      if (numberRef.current && rollingNumber.update(time - lastTime)) {
        lastTime = time;
        numberRef.current.textContent = rollingNumber.rollingValue;
      }
      if (rollingNumber.isRunning) {
        requestAnimationFrame(rafLoop);
      } else {
        cancelAnimationFrame(animFrame);
      }
    };

    rafLoop();

    const unsub = useResourcesStore.subscribe((item) => {
      rollingNumber.start(item);
      rafLoop();
    }, selector);

    return () => {
      unsub();
      rollingNumber.stop();
      cancelAnimationFrame(animFrame);
    };
  }, []);

  return (
    <div className="flex items-center">
      {image}
      <span
        style={{ minWidth: "5em", display: "inline-block" }}
        ref={numberRef}
        className={`ml-2 text-gray-200 text-${scaledTextSize}`}
      ></span>
    </div>
  );
};

export default RollingResource;
