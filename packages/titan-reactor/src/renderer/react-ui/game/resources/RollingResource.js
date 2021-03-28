import React, { useEffect, useRef } from "react";
import useResourcesStore from "../../../stores/realtime/resourcesStore";
import RollingNumber from "./RollingNumber";

export default ({ image, scaledTextSize, selector }) => {
  const numberRef = useRef();
  const rollingNumber = new RollingNumber(
    selector(useResourcesStore.getState()),
    numberRef
  );

  const setDom = (value) => {
    if (!numberRef.current) return;
    rollingNumber.value = value;
  };

  useEffect(() => {
    setDom(selector(useResourcesStore.getState()));

    const unsub = useResourcesStore.subscribe((item) => {
      setDom(item);
    }, selector);

    return () => {
      unsub();
      rollingNumber.dispose();
    };
  }, []);

  return (
    <div className="flex items-center">
      {image}
      <span
        ref={numberRef}
        className={`ml-2 text-gray-200 text-${scaledTextSize}`}
      ></span>
    </div>
  );
};
