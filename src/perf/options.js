import React, { useState } from "react"
import Visible from "../hud/visible"

const tabs = {
  camera: "camera",
  perf: "perf",
  advanced: "advanced",
  observer: "observer",
}

const Tab = ({ tabName, activeTab, children }) => (
  <Visible visible={tabName === activeTab}>{children}</Visible>
)

export default ({ defaultOptions }) => {
  const [expanded, setExpanded] = useState(false)
  const [tab, setTab] = useState(tabs.camera)
  const [options, setOptions] = useState(defaultOptions)

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
          <button onClick={(e) => setTab(tabs.camera)}>Camera</button>
          <button onClick={(e) => setTab(tabs.perf)}>
            Performance Options
          </button>
          <button onClick={(e) => setTab(tabs.observer)}>Observer</button>
          <button onClick={(e) => setTab(tabs.advanced)}>Advanced</button>
        </div>

        <Tab tabName={tabs.camera} activeTab={tab}>
          <ul className="tab-content">
            <li>Constrain Camera: A little|A lot|Not at all</li>
            <li>Camera Mouse Pan Speed: 5/10</li>
            <li>Camera Mouse Rotate Speed: 5/10</li>
            <li>Camera Mouse Move Easing: 5/10</li>
            <li>Camera Keyboard Panning Speed: 5/10</li>
          </ul>
        </Tab>
        <Tab tabName={tabs.advanced} activeTab={tab}>
          <ul></ul>
        </Tab>
        <Tab tabName={tabs.perf} activeTab={tab}>
          <ul className="tab-content">
            <li>Antialias: ON</li>
            <li>Shadows: ON</li>
            <li>Tone Mapping: Default</li>
            <li>Show Doodads: ON</li>
            <li>Fog Of War Quality: OFF/LOW/HIGH</li>
            <li>FPS: 60 or 30</li>
          </ul>
        </Tab>
        <Tab tabName={tabs.observer} activeTab={tab}>
          <ul className="tab-content">
            <li>Play/Pause: P</li>
            <li>Speed - Up: U</li>
            <li>Speed - Down: D</li>
            <li>Speed - Auto: S + A</li>
            <li>Speed - Fastest: S + F</li>
            <li>Production - Toggle: Q</li>
            <li>MiniMap - Toggle: W</li>
            <li>Selected Units - Toggle: E</li>
            <li>Player 1 - Actions: 1 + A</li>
            <li>Player 2 - Actions: 2 + A</li>
            <li>Camera - Intro Player 1: C + 1</li>
            <li>Camera - Intro Player 2: C + 2</li>
            <li>Camera - Center Map: C + M</li>
            <li>Camera - Top Of Map: C + T</li>
            <li>Reveal Map: R</li>
            <li>Analytics - Unit Details: A + D</li>
            <li>Analytics - Resources: A + R</li>
            <li>Analytics - Units: A + U</li>
            <li>Analytics - Movements: A + M</li>
          </ul>
        </Tab>
      </Visible>
    </>
  )
}
