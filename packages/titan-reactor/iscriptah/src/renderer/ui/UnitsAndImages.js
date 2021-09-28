import React from "react";
import { connect } from "react-redux";
import Unit from "./Unit";
import Sprite from "./Sprite";
import Image from "./Image";
import { imageSelected, spriteSelected, unitSelected } from "../iscriptReducer";
import { unitImageTabChanged } from "../appReducer";

const UnitsAndImages = ({
  bwDat,
  search,
  selectUnit,
  selectSprite,
  selectImage,
  expandedUnit,
  selectedTab,
  selectTab,
}) => {
  return (
    <aside className="bg-gray-100 flex-0 flex flex-col max-h-screen overflow-y-scroll pb-10">
      <section className="flex-1 p-2" style={{ minWidth: "20rem" }}>
        <ul className="flex justify-around mb-2">
          <li
            className={`text-sm p-2 cursor-pointer hover:bg-gray-300 flex-grow ${
              selectedTab === "units" ? "bg-gray-300" : ""
            }`}
            onClick={() => selectTab("units")}
          >
            Units
          </li>
          <li
            className={`text-sm p-2 cursor-pointer hover:bg-gray-300 flex-grow ${
              selectedTab === "sprites" ? "bg-gray-300" : ""
            }`}
            onClick={() => selectTab("sprites")}
          >
            Sprites
          </li>
          <li
            className={`text-sm p-2 cursor-pointer hover:bg-gray-300 flex-grow ${
              selectedTab === "images" ? "bg-gray-300" : ""
            }`}
            onClick={() => selectTab("images")}
          >
            Images
          </li>
        </ul>
        {selectedTab === "units" && (
          <ul className="divide-y-2">
            {" "}
            {bwDat.units
              .filter((unit) => {
                if (search) {
                  return (
                    unit.name.toLowerCase().includes(search.toLowerCase()) ||
                    unit.index == search
                  );
                } else {
                  return true;
                }
              })
              .map((unit, i) => {
                return (
                  <li key={unit.index} className={i === 0 ? "" : "pt-4"}>
                    <Unit
                      unit={unit}
                      bwDat={bwDat}
                      onClick={() => selectUnit(unit)}
                      expanded={unit === expandedUnit}
                    />
                  </li>
                );
              })}
          </ul>
        )}
        {selectedTab === "sprites" && (
          <ul className="divide-y-2">
            {" "}
            {bwDat.sprites
              .filter((sprite) => {
                if (search) {
                  return (
                    sprite.name.toLowerCase().includes(search.toLowerCase()) ||
                    sprite.index == search
                  );
                } else {
                  return true;
                }
              })
              .map((sprite, i) => {
                return (
                  <li key={sprite.index} className={i === 0 ? "" : "pt-4"}>
                    <Sprite
                      sprite={sprite}
                      bwDat={bwDat}
                      onClick={() => selectSprite(sprite)}
                    />
                  </li>
                );
              })}
          </ul>
        )}
        {selectedTab === "images" && (
          <ul className="divide-y-2">
            {" "}
            {bwDat.images
              .filter((image) => {
                if (search) {
                  return (
                    image.name.toLowerCase().includes(search.toLowerCase()) ||
                    image.index == search
                  );
                } else {
                  return true;
                }
              })
              .map((image, i) => {
                return (
                  <li key={image.index} className={i === 0 ? "" : "pt-4"}>
                    <Image
                      image={image}
                      bwDat={bwDat}
                      onClick={() => selectImage(image)}
                    />
                  </li>
                );
              })}
          </ul>
        )}
      </section>
    </aside>
  );
};

export default connect(
  (state) => ({
    expandedUnit: state.iscript.unit,
    selectedTab: state.app.unitImageTab,
  }),
  (dispatch) => ({
    selectUnit: (unit) => dispatch(unitSelected(unit)),
    selectSprite: (unit) => dispatch(spriteSelected(unit)),
    selectImage: (unit) => dispatch(imageSelected(unit)),
    selectTab: (tab) => dispatch(unitImageTabChanged(tab)),
  })
)(UnitsAndImages);
