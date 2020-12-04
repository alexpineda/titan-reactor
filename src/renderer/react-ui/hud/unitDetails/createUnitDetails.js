import React, { useState } from "react";
import Circle from "react-circle";
import "../../css/tailwind.min.css";
import "../../css/styles.css";
import Autosuggest from "react-autosuggest";
import { UnitDAT } from "../../../../main/units/UnitsDAT";
import { unitTypes } from "../../../../common/bwdat/unitTypes";
import Weapon from "./Weapon";

const renderTime = (frames) => {
  let ms = frames * 42;
  let s = 0;
  let m = 0;

  if (ms > 1000) {
    s = Math.floor(ms / 1000);
    ms = ms % 1000;
    if (s > 60) {
      m = Math.floor(s / 60);
      s = s % 60;
      return `${m}m ${s}s`;
    } else {
      return `${Math.floor(s)}s`;
    }
  } else {
    return `${ms}ms`;
  }
};

const Display = {
  Unit: "Unit",
  GroundWeapon: "GroundWeapon",
  AirWeapon: "AirWeapon",
};

export default (bwDat, defaultUnitTypeId = 0) => {
  const unitSuggestions = bwDat.units
    .map((unit) => new UnitDAT(unit))
    .filter(
      (unit, i) =>
        !unit.hero() &&
        !unit.invincible() &&
        !unit.resourceContainer() &&
        !unit.pickupItem() &&
        ![
          unitTypes.zergOvermind,
          unitTypes.zergOvermindWithShell,
          unitTypes.xelNagaTemple,
          unitTypes.overmindCocoon,
        ].includes(i)
    );

  return ({ onClose }) => {
    const [unitTypeId, setUnitTypeId] = useState(defaultUnitTypeId);
    const [searchValue, setSearchValue] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [display, setDisplay] = useState(Display.Unit);
    const [queue, setQueue] = useState([defaultUnitTypeId]);
    const [queuePosition, setQueuePosition] = useState(0);

    console.log("queue", queue);
    console.log("queuePosition", queuePosition);
    const unit = new UnitDAT(bwDat.units[unitTypeId]);
    const isBuilding = unit.building();

    const units = unitSuggestions.filter(
      (unit) => unit.building() === isBuilding
    );

    const getMax = (key) =>
      units.reduce((max, unit) => (unit[key] > max ? unit[key] : max), 0);

    const maxUnitHP = getMax("hp");
    const maxUnitShields = getMax("shields");
    const maxUnitArmor = getMax("armor");
    const maxUnitBuildTime = getMax("buildTime");
    const maxUnitSize = 3;

    const groundWeapon =
      unit.groundWeapon !== 130 ? bwDat.weapons[unit.groundWeapon] : null;
    const airWeapon =
      unit.airWeapon !== 130 ? bwDat.weapons[unit.airWeapon] : null;

    const sameWeapon = unit.groundWeapon === unit.airWeapon;

    const armorUpgrade = unit.armorUpgrade;
    const subUnit = unit.subUnit1 !== 130 ? bwDat.units[unit.subUnit1] : null;

    let groundTargetAcquisitionRange = false;
    let airTargetAcquisitionRange = false;

    const getSuggestions = (value) => {
      const inputValue = value.trim().toLowerCase();

      const inputLength = inputValue.length;

      return inputLength === 0
        ? []
        : unitSuggestions
            .filter(({ name }) => name.toLowerCase().includes(inputValue))
            .slice(0, 3);
    };

    const getSuggestionValue = (suggestion) => suggestion.name;

    const renderSuggestion = (suggestion) => (
      <div className="text-gray-800">{suggestion.name}</div>
    );


    return (
      <div
        className="absolute overflow-y-auto overflow-x-hidden rounded text-gray-300 p-6"
        style={{
          transform: "translate(-50%, -50%)",
          left: "50%",
          top: "50%",
          backgroundColor: "rgba(0,0,0,0.8)",
        }}
      >
        <div className="flex mb-2">
          <Autosuggest
            suggestions={suggestions}
            onSuggestionsFetchRequested={({ value }) =>
              setSuggestions(getSuggestions(value))
            }
            onSuggestionsClearRequested={() => setSuggestions([])}
            getSuggestionValue={getSuggestionValue}
            renderSuggestion={renderSuggestion}
            inputProps={{
              placeholder: "Type a unit name",
              value: searchValue,
              onChange: (event, { newValue }) => {
                console.log("newValue", newValue);
                setSearchValue(newValue);
                const unit = bwDat.units.findIndex(
                  ({ name }) => name == newValue
                );
                if (unit !== -1) {
                  setUnitTypeId(unit);
                  const newQueue = [...queue.slice(0, queuePosition + 1), unit];
                  setQueue(newQueue);
                  setQueuePosition(newQueue.length - 1);
                }
              },
            }}
          />
          {queue.length > 1 && <span>
            <span
            className={`cursor-pointer select-none ${queuePosition === 0 ? "text-gray-700" : ""}`}
             onClick={() => {
              const pos = Math.max(0, queuePosition - 1);
              setQueuePosition(pos)
             setUnitTypeId(queue[pos]); 
            }}>←</span>
            <span 
            className={`cursor-pointer select-none ${queuePosition === queue.length -1 ? "text-gray-700" : ""}`}
            onClick={() => {
              const pos = Math.min(queue.length - 1, queuePosition + 1);
              setQueuePosition(pos)
             setUnitTypeId(queue[pos]); 

            }}>→</span>
          </span>}
          <div className="ml-auto cursor-pointer" onClick={onClose}>
            X
          </div>
        </div>
        <div className="flex justify-evenly">
          <aside style={{ width: "400px" }}  className="bg-gray-800 p-4 flex flex-col justify-center items-center rounded-lg mr-10
">
            <article style={{ zoom: "1.3" }}>
            <div
              className="text-2xl mb-5 cursor-pointer"
              onClick={() => setDisplay(Display.Unit)}
            >
              {unit.name}
            </div>

                <div className="flex">
                  <div className="mr-3 lead-4">
                    <p style={{whiteSpace: "nowrap"}}>
                      <span className="text-sm text-gray-400">MINERALS</span>{" "}
                      <span className="font-medium">{unit.mineralCost}</span>
                    </p>
                    <p style={{whiteSpace: "nowrap"}}>
                      <span className="text-sm text-gray-400">VESPENE</span>{" "}
                      <span className="font-medium">{unit.vespeneCost}</span>
                    </p>
                    {Boolean(unit.supplyRequired) && (
                      <p style={{whiteSpace: "nowrap"}}>
                        <span className="text-sm text-gray-400">SUPPLY</span>{" "}
                        <span className="font-medium">
                          {unit.supplyRequired / 2}
                        </span>
                      </p>
                    )}

                    {Boolean(unit.supplyProvided) && (
                      <p style={{whiteSpace: "nowrap"}}>
                        <span className="text-sm text-gray-400">PROVIDES</span>{" "}
                        <span className="font-medium">
                          {unit.supplyProvided / 2}
                        </span>
                      </p>
                    )}
                    {Boolean(unit.spaceProvided) && (
                      <p style={{whiteSpace: "nowrap"}}>
                        <span className="text-sm text-gray-400">CARGO</span>{" "}
                        <span className="font-medium">
                          {unit.spaceProvided / 2}
                        </span>
                      </p>
                    )}
                  </div>
                  <div>
                    <div className="flex mb-2">
                      <div className="absolute">
                        <Circle
                          size="50" // String: Defines the size of the circle.
                          lineWidth="50" // String: Defines the thickness of the circle's stroke.
                          progress={Math.floor((unit.hp / maxUnitHP) * 100)} // String: Update to change the progress and percentage.
                          progressColor="rgb(239, 68, 68)" // String: Color of "progress" portion of circle.
                          bgColor="rgb(153, 27, 27)" // String: Color of "empty" portion of circle.
                          textColor="#6b778c" // String: Color of percentage text color.
                          textStyle={{
                            font: "bold 4rem Helvetica, Arial, sans-serif", // CSSProperties: Custom styling for percentage.
                          }}
                          percentSpacing={10} // Number: Adjust spacing of "%" symbol and number.
                          roundedStroke={false} // Boolean: Rounded/Flat line ends
                          showPercentage={false} // Boolean: Show/hide percentage.
                          showPercentageSymbol={false} // Boolean: Show/hide only the "%" symbol.
                        />

                        {Boolean(unit.shieldsEnabled) && (
                          <div
                            className="relative"
                            style={{ left: "5px", top: "-45px" }}
                          >
                            <Circle
                              size="40" // String: Defines the size of the circle.
                              lineWidth="50" // String: Defines the thickness of the circle's stroke.
                              progress={Math.floor(
                                (unit.shields / maxUnitShields) * 100
                              )} // String: Update to change the progress and percentage.
                              progressColor="rgb(59, 130, 246)" // String: Color of "progress" portion of circle.
                              bgColor="rgb(30, 64, 175)" // String: Color of "empty" portion of circle.
                              textColor="#6b778c" // String: Color of percentage text color.
                              textStyle={{
                                font: "bold 4rem Helvetica, Arial, sans-serif", // CSSProperties: Custom styling for percentage.
                              }}
                              percentSpacing={10} // Number: Adjust spacing of "%" symbol and number.
                              roundedStroke={false} // Boolean: Rounded/Flat line ends
                              showPercentage={false} // Boolean: Show/hide percentage.
                              showPercentageSymbol={false} // Boolean: Show/hide only the "%" symbol.
                            />
                          </div>
                        )}

                        <div
                          className="relative"
                          style={{
                            left: "10px",
                            top: unit.shieldsEnabled ? "-80px" : "-40px",
                          }}
                        >
                          <Circle
                            size="30" // String: Defines the size of the circle.
                            lineWidth="50" // String: Defines the thickness of the circle's stroke.
                            progress={Math.floor(
                              (unit.armor / maxUnitArmor) * 100
                            )} // String: Update to change the progress and percentage.
                            progressColor="rgb(107, 114, 128)" // String: Color of "progress" portion of circle.
                            bgColor="rgb(31, 41, 55)" // String: Color of "empty" portion of circle.
                            textColor="#6b778c" // String: Color of percentage text color.
                            textStyle={{
                              font: "bold 4rem Helvetica, Arial, sans-serif", // CSSProperties: Custom styling for percentage.
                            }}
                            percentSpacing={10} // Number: Adjust spacing of "%" symbol and number.
                            roundedStroke={false} // Boolean: Rounded/Flat line ends
                            showPercentage={false} // Boolean: Show/hide percentage.
                            showPercentageSymbol={false} // Boolean: Show/hide only the "%" symbol.
                          />
                        </div>
                      </div>

                      <div style={{ width: "50px", height: "50px" }}>
                        &nbsp;
                      </div>
                      <div className="ml-3 leading-4">
                        <p style={{whiteSpace: "nowrap"}}>
                          <span className="text-sm text-gray-400">HP</span>{" "}
                          <span className="font-medium">{unit.hp}</span>
                        </p>
                        {Boolean(unit.shieldsEnabled) && (
                          <p style={{whiteSpace: "nowrap"}}>
                            
                            <span className="text-sm text-gray-400">
                              SHIELDS
                            </span>{" "}
                            <span className="font-medium">{unit.shields}</span>
                            
                          </p>
                        )}
                        <p style={{whiteSpace: "nowrap"}}>
                          <span className="text-sm text-gray-400">ARMOR</span>{" "}
                          <span className="font-medium">{unit.armor}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex mb-2">
                      <div className="absolute">
                        <Circle
                          size="50" // String: Defines the size of the circle.
                          lineWidth="50" // String: Defines the thickness of the circle's stroke.
                          progress={Math.floor(
                            (unit.buildTime / maxUnitBuildTime) * 100
                          )} // String: Update to change the progress and percentage.
                          progressColor="rgb(245, 158, 11)" // String: Color of "progress" portion of circle.
                          bgColor="rgb(146, 64, 14)" // String: Color of "empty" portion of circle.
                          textColor="#6b778c" // String: Color of percentage text color.
                          textStyle={{
                            font: "bold 4rem Helvetica, Arial, sans-serif", // CSSProperties: Custom styling for percentage.
                          }}
                          percentSpacing={10} // Number: Adjust spacing of "%" symbol and number.
                          roundedStroke={false} // Boolean: Rounded/Flat line ends
                          showPercentage={false} // Boolean: Show/hide percentage.
                          showPercentageSymbol={false} // Boolean: Show/hide only the "%" symbol.
                        />

                        <div
                          className="relative"
                          style={{ left: "5px", top: "-45px" }}
                        >
                          <Circle
                            size="40" // String: Defines the size of the circle.
                            lineWidth="50" // String: Defines the thickness of the circle's stroke.
                            progress={Math.floor(
                              (unit.unitSize / maxUnitSize) * 100
                            )} // String: Update to change the progress and percentage.
                            progressColor="rgb(107, 114, 128)" // String: Color of "progress" portion of circle.
                            bgColor="rgb(31, 41, 55)" // String: Color of "empty" portion of circle.
                            textColor="#6b778c" // String: Color of percentage text color.
                            textStyle={{
                              font: "bold 4rem Helvetica, Arial, sans-serif", // CSSProperties: Custom styling for percentage.
                            }}
                            percentSpacing={10} // Number: Adjust spacing of "%" symbol and number.
                            roundedStroke={false} // Boolean: Rounded/Flat line ends
                            showPercentage={false} // Boolean: Show/hide percentage.
                            showPercentageSymbol={false} // Boolean: Show/hide only the "%" symbol.
                          />
                        </div>
                      </div>

                      <div style={{ width: "50px", height: "50px" }}>
                        &nbsp;
                      </div>
                      <div className="ml-3 leading-4">
                        <p style={{whiteSpace: "nowrap"}}>
                          <span className="text-sm text-gray-400">BUILD</span>{" "}
                          <span className="font-medium">
                            {renderTime(unit.buildTime)}
                          </span>
                        </p>
                        <p style={{whiteSpace: "nowrap"}}>
                          <span className="text-sm text-gray-400">SIZE</span>{" "}
                          <span className="font-medium">{unit.unitSize}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div
              className="text-2xl mb-5 invisible"
              onClick={() => setDisplay(Display.Unit)}
            >
              {unit.name}
            </div>
      {/* <div
          className="grid mt-2"
          style={{
            gridTemplateColumns: "auto auto",
            gridColumnGap: "1rem",
          }}
        >
          {groundWeapon && (
            <div
              className="bg-gray-800 px-2 py-1 rounded text-center "
              onClick={() => setDisplay(Display.GroundWeapon)}
            >
              <p className="font-medium">{groundWeapon.name}</p>
              <p className="text-xs text-gray-400">
                {sameWeapon ? "GROUND & AIR WEAPON" : "GROUND WEAPON"}
              </p>
            </div>
          )}
          {airWeapon && !sameWeapon && (
            <div className="bg-gray-800 px-2 py-1 rounded text-center ">
              <p className="font-medium">{airWeapon.name}</p>
              <p className="text-xs text-gray-400">AIR WEAPON</p>
            </div>
          )}
        </div> */}
      </article>
          </aside>
          <main className="flex flex-col  bg-gray-800">
            <canvas width="400" height="400" className="bg-gray-600" />
            <p className="text-center">SD | HD | 3D </p>
          </main>
          {/* <div
          className="grid mt-2"
          style={{
            gridTemplateColumns: "auto auto",
            gridColumnGap: "1rem",
          }}
        >
          {display === Display.GroundWeapon && <div
              className="bg-gray-800 px-2 py-1 rounded text-center "
              onClick={() => setDisplay(Display.GroundWeapon)}
            >
              <p className="font-medium">{groundWeapon.name}</p>
              <p className="text-xs text-gray-400">
                {sameWeapon ? "GROUND & AIR WEAPON" : "GROUND WEAPON"}
              </p>
            </div>}
            <div>sight range{unit.sightRange}</div>

        </div> */}
        </div>
        
      </div>
    );
  };
};
