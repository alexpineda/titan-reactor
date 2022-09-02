import Unit from "./unit";
import Sprite from "./sprite";
import Image from "./image";
import {
  useIScriptahStore,
  useIscriptStore,
  setUnitImageTab,
  setUnit,
  setSprite,
  setImage,
} from "../stores";
import { useGameStore } from "@stores/game-store";

export const UnitsAndImages = ({ search }: { search: number | string }) => {
  const bwDat = useGameStore((state) => state.assets!.bwDat);

  const { selectedTab } = useIScriptahStore((state) => ({
    selectedTab: state.unitImageTab,
  }));

  const { expandedUnit } = useIscriptStore((state) => ({
    expandedUnit: state.unit,
  }));

  return (
    <aside className="bg-gray-100 flex-0 flex flex-col max-h-screen overflow-y-scroll pb-10">
      <section className="flex-1 p-2" style={{ minWidth: "20rem" }}>
        <ul className="flex justify-around mb-2">
          <li
            className={`text-sm p-2 cursor-pointer hover:bg-gray-300 flex-grow ${
              selectedTab === "units" ? "bg-gray-300" : ""
            }`}
            onClick={() => setUnitImageTab("units")}
          >
            Units
          </li>
          <li
            className={`text-sm p-2 cursor-pointer hover:bg-gray-300 flex-grow ${
              selectedTab === "sprites" ? "bg-gray-300" : ""
            }`}
            onClick={() => setUnitImageTab("sprites")}
          >
            Sprites
          </li>
          <li
            className={`text-sm p-2 cursor-pointer hover:bg-gray-300 flex-grow ${
              selectedTab === "images" ? "bg-gray-300" : ""
            }`}
            onClick={() => setUnitImageTab("images")}
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
                    unit.name
                      .toLowerCase()
                      .includes((search as string).toLowerCase()) ||
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
                      onClick={() => setUnit(unit)}
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
                    sprite.name
                      .toLowerCase()
                      .includes((search as string).toLowerCase()) ||
                    sprite.index == search
                  );
                } else {
                  return true;
                }
              })
              .map((sprite, i: number) => {
                return (
                  <li key={sprite.index} className={i === 0 ? "" : "pt-4"}>
                    <Sprite sprite={sprite} onClick={() => setSprite(sprite)} />
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
                    image.name
                      .toLowerCase()
                      .includes((search as string).toLowerCase()) ||
                    image.index == search
                  );
                } else {
                  return true;
                }
              })
              .map((image, i: number) => {
                return (
                  <li key={image.index} className={i === 0 ? "" : "pt-4"}>
                    <Image image={image} onClick={() => setImage(image)} />
                  </li>
                );
              })}
          </ul>
        )}
      </section>
    </aside>
  );
};
export default UnitsAndImages;
