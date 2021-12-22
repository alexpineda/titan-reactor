import { easePolyOut } from "d3-ease";
import React, { useEffect, useRef } from "react";

import {
  keysOnly,
  useGameStore,
  GameStore,
  useProductionStore,
  ProductionStore,
} from "../../../stores";

import {
  ResearchInProduction,
  UnitInProduction,
  UpgradeInProduction,
  ResearchCompleted,
  UpgradeCompleted,
} from "../../../../common/types";
import { AssetsMissingError } from "../../../../common/errors";

interface Props {
  type: "units" | "tech" | "upgrades";
  color: string;
  playerId: number;
  index: number;
}

type ProductionItemType =
  | ResearchInProduction
  | UnitInProduction
  | UpgradeInProduction;

type CompletedType = ResearchCompleted | UpgradeCompleted;
const poly = easePolyOut.exponent(0.5);

const iconsSelector = (state: GameStore) => state?.assets?.cmdIcons;
const isCompletedTech = (item: ProductionItemType): item is CompletedType => {
  return Boolean(
    item.remainingBuildTime === 0 && (item.isTech || item.isUpgrade)
  );
};

// an instance of a production item, either unit, research or upgrade
const ProductionItem = ({ type, index, color, playerId }: Props) => {
  const cmdIcons = useGameStore(iconsSelector);
  if (!cmdIcons) {
    throw new AssetsMissingError();
  }
  const wrapperRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const outlineRef = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLParagraphElement>(null);

  const unitBelongsToPlayer = (u: UnitInProduction) => u.ownerId === playerId;

  const selector = (state: ProductionStore): ProductionItemType => {
    if (type === "units") {
      return state[type].filter(unitBelongsToPlayer).slice(0, 10)[index];
    } else {
      return state[type][playerId][index];
    }
  };

  const setDom = (item: ProductionItemType) => {
    if (
      !wrapperRef.current ||
      !imgRef.current ||
      !countRef.current ||
      !progressRef.current ||
      !outlineRef.current
    )
      return;

    if (item) {
      wrapperRef.current.style.display = "block";

      if (item.count > 1) {
        countRef.current.textContent = String(item.count);
        countRef.current.style.display = "block";
      } else {
        countRef.current.style.display = "hidden";
      }

      imgRef.current.src = cmdIcons[item.icon];
      const pct = poly(1 - item.remainingBuildTime / item.buildTime) * 100;
      progressRef.current.style.backgroundImage = `linear-gradient(90deg, ${color}ee 0%, ${color}aa ${pct}%, rgba(0,0,0,0.5) ${pct}%)`;

      if (isCompletedTech(item)) {
        outlineRef.current.style.outline = `2px groove ${color}aa`;
        // using a property as state to determine whether to add glow (only once)
        if (Date.now() - item.timeCompleted < 4000) {
          outlineRef.current.style.animation = `glow-${item.ownerId} 0.4s 10 alternate`;
        } else {
          outlineRef.current.style.animation = "";
        }
      } else {
        outlineRef.current.style.animation = "";
        outlineRef.current.style.outline = "";
      }
    } else {
      wrapperRef.current.style.display = "none";
    }
  };

  useEffect(() => {
    setDom(selector(useProductionStore.getState()));

    return useProductionStore.subscribe(
      (item) => {
        setDom(item);
      },
      selector,
      keysOnly
    );
  }, [type, index, color, playerId]);

  return (
    <div ref={wrapperRef} className="w-10 h-10 mr-1 relative">
      <img
        ref={imgRef}
        style={{
          filter: "grayscale(1) brightness(6)",
        }}
      />
      <div
        ref={progressRef}
        className="absolute left-0 bottom-0 right-0 h-1"
      ></div>
      <div
        ref={outlineRef}
        className="absolute left-0 bottom-0 right-0 top-0"
      ></div>
      <p
        ref={countRef}
        className="text-white absolute text-xs px-1 rounded bottom-0 right-0 z-20"
        style={{
          opacity: "0.9",
          fontFamily: "conthrax",
          fontWeight: "900",
          textShadow: "-2px -2px 2px black",
        }}
      ></p>
    </div>
  );
};

export default ProductionItem;
