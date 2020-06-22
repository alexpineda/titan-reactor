import React, { useState } from "react";
import Visible from "../../utils/visible";

const tabs = {
  camera: "camera",
  perf: "perf",
  replay: "replay",
  overlay: "overlay",
  analytics: "analytics",
};

const Tab = ({ tabName, activeTab, children }) => (
  <Visible visible={tabName === activeTab}>{children}</Visible>
);

export default ({ defaultOptions }) => {
  const [expanded, setExpanded] = useState(false);
  const [tab, setTab] = useState(tabs.camera);
  const [options, setOptions] = useState(defaultOptions);

  return (
    <>
      <Visible visible={expanded}>
        <button onClick={(e) => setExpanded(false)}>Hide Options</button>
      </Visible>
      <Visible visible={!expanded}>
        <button onClick={(e) => setExpanded(true)}>Show Options</button>
      </Visible>

      <Visible visible={expanded}>
        <div>
          <button onClick={(e) => setTab(tabs.replay)}>Replay</button>
          <button onClick={(e) => setTab(tabs.overlay)}>Overlay</button>
          <button onClick={(e) => setTab(tabs.camera)}>Camera</button>
          <button onClick={(e) => setTab(tabs.analytics)}>Analytics</button>
          <button onClick={(e) => setTab(tabs.perf)}>Performance</button>
        </div>

        <Tab tabName={tabs.camera} activeTab={tab}>
          <ul className="tab-content">
            <li>
              <strong>Camera Control</strong>
            </li>
            <li>Constrain Camera: A little|A lot|Not at all</li>
            <li>Camera Mouse Pan Speed: 5/10</li>
            <li>Camera Mouse Rotate Speed: 5/10</li>
            <li>Camera Mouse Zoom Speed: 5/10</li>
            <li>Camera Mouse Move Easing: 5/10</li>
            <li>Camera Keyboard Panning Speed: 5/10</li>
            <li>
              <strong>Camera Automation</strong>
            </li>
            <li>Camera - Intro Player 1: C + 1</li>
            <li>Camera - Intro Player 2: C + 2</li>
            <li>Camera - Center Map: C + M</li>
            <li>Camera - Top Of Map: C + T</li>
          </ul>
        </Tab>
        <Tab tabName={tabs.replay} activeTab={tab}>
          <ul>
            <li>Play/Pause: P</li>
            <li>Speed - Up: U</li>
            <li>Speed - Down: D</li>
            <li>Speed - Auto: S + A</li>
            <li>Speed - Fastest: S + F</li>
          </ul>
        </Tab>
        <Tab tabName={tabs.overlay} activeTab={tab}>
          <ul>
            <li>Toggle All - Toggle: A</li>
            <li>Production - Toggle: Q</li>
            <li>MiniMap - Toggle: W</li>
            <li>Selected Units - Toggle: E</li>
          </ul>
        </Tab>
        <Tab tabName={tabs.perf} activeTab={tab}>
          <ul className="tab-content">
            <li>Antialias: ON</li>
            <li>Shadows: ON</li>
            <li>Tone Mapping: Default</li>
            <li>Show Doodads: ON</li>
            <li>Fog Of War Quality: OFF/LOW/HIGH</li>
            <li>Terrain Deformation on Explosions: ON/OFF</li>
            <li>FPS: 60 or 30</li>
          </ul>
        </Tab>
        <Tab tabName={tabs.analytics} activeTab={tab}>
          <ul className="tab-content">
            <li>Reveal Map: R</li>
            <li>Madden Mode: ON/OFF</li>
            <li>Player 1 Commands Heatmap</li>
            <li>Player 2 Commands Heatmap</li>
            <li>Resources: A + R</li>
            <li>Units: A + U</li>
            <li>Movements: A + M</li>
            <li>Previous Battles: A + B</li>
            <li>Show Big Kill Labels: Never - After X Kills</li>
          </ul>
        </Tab>
      </Visible>
    </>
  );
};
