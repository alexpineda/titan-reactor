import React from "react";

export default ({ phrases }) => {
  return (
    <div
      className="w-full bg-gray-900 text-white px-6 pt-3 pb-1 flex flex-col items-center justify-center"
      style={{ minHeight: "100vh", maxHeight: "100vh" }}
    >
      <p className="text-3xl">Titan Reactor</p>
      <p className="">{phrases["LOADING"]}</p>
    </div>
  );
};
