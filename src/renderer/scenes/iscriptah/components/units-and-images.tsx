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

const TabItem = ({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) => {
  return (
    <li
      style={{
        fontSize: "var(--font-size-1)",
        cursor: "pointer",
        padding: "var(--size-2)",
        flexGrow: 1,
        background: selected ? "var(--gray-2)" : "none",
      }}
      onClick={onClick}
    >
      {label}
    </li>
  );
};

export const UnitsAndImages = ({ search }: { search: number | string }) => {
  const bwDat = useGameStore((state) => state.assets!.bwDat);

  const { selectedTab } = useIScriptahStore((state) => ({
    selectedTab: state.unitImageTab,
  }));

  const { expandedUnit } = useIscriptStore((state) => ({
    expandedUnit: state.unit,
  }));

  return (
    <aside
      style={{
        backgroundColor: "var(--gray-1)",
        display: "flex",
        flexDirection: "column",
        maxHeight: "50%",
        overflowY: "scroll",
        paddingBottom: "var(--size-5)",
      }}
    >
      <section style={{ flex: 1, padding: "var(--size-2)", minWidth: "20rem" }}>
        <ul
          style={{
            display: "flex",
            justifyContent: "space-around",
            marginBottom: "var(--size-2)",
          }}
        >
          <TabItem
            label={"Units"}
            selected={selectedTab === "units"}
            onClick={() => setUnitImageTab("units")}
          />
          <TabItem
            label={"Sprites"}
            selected={selectedTab === "sprites"}
            onClick={() => setUnitImageTab("sprites")}
          />
          <TabItem
            label={"Images"}
            selected={selectedTab === "images"}
            onClick={() => setUnitImageTab("images")}
          />
        </ul>
        {selectedTab === "units" && (
          <ul>
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
          <ul>
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
          <ul>
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
