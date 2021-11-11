import React, { useEffect, useRef } from "react";
import { useResourcesStore, ResourcesStore } from "../../../stores";
import RollingNumber from "./rolling-number";

interface Props {
  image: React.ReactNode;
  //@todo change to union of supported text sizes
  scaledTextSize: string;
  selector: (state: ResourcesStore) => number;
}

const RollingResource = ({ image, scaledTextSize, selector }: Props) => {
  const numberRef = useRef();

  useEffect(() => {
    const rollingNumber = new RollingNumber(
      selector(useResourcesStore.getState())
    );

    if (numberRef.current) {
      numberRef.current.textContent = rollingNumber.rollingValue;
    }
    let lastTime = 0;
    let animFrame = 0;

    const rafLoop = (time: number) => {
      if (numberRef.current && rollingNumber.update(time - lastTime)) {
        lastTime = time;
        numberRef.current.textContent = rollingNumber.rollingValue;
      }
      if (rollingNumber.isRunning) {
        animFrame = requestAnimationFrame(rafLoop);
      } else {
        cancelAnimationFrame(animFrame);
      }
    };

    rafLoop(0);

    const unsub = useResourcesStore.subscribe((item) => {
      rollingNumber.start(item);
      rafLoop(0);
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
