import React, { useEffect, useRef } from "react";
import { useResourcesStore, ResourcesStore } from "../../../stores";

interface Props {
  image: React.ReactNode;
  //@todo change to union of supported text sizes
  scaledTextSize: string;
  selector: (state: ResourcesStore) => number;
}
const BasicResource = ({ image, scaledTextSize, selector }: Props) => {
  const numberRef = useRef();

  const setDom = (value: number | string) => {
    if (!numberRef.current) return;
    numberRef.current.textContent = value;
  };

  useEffect(() => {
    setDom(selector(useResourcesStore.getState()));

    return useResourcesStore.subscribe((item) => {
      setDom(item);
    }, selector);
  }, []);

  return (
    <div className="flex items-center">
      {image}
      <span
        ref={numberRef}
        className={`ml-2 text-gray-200 text-${scaledTextSize}`}
        style={{ minWidth: "3em" }}
      ></span>
    </div>
  );
};

export default BasicResource;
