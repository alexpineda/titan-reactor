import React from "react";
import useSettingsStore from "../../stores/settingsStore";

export default () => {
  const phrases = useSettingsStore((state) => state.phrases);

  return (
    <div
      className="absolute left-0 top-0 bottom-0 right-0 z-20 bg-gray-900 text-white px-6 pt-3 pb-1 flex flex-col items-center justify-center cursor-wait"
      style={{ minHeight: "100vh", maxHeight: "100vh" }}
    >
      <p className="text-3xl">Titan Reactor</p>
      <p className="">{phrases["LOADING"]}</p>
    </div>
  );
};
