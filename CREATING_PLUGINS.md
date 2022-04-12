# Table of Contents
- [Table of Contents](#table-of-contents)
  - [Overview](#overview)
  - [Your first plugin package.json](#your-first-plugin-packagejson)
  - [How it works](#how-it-works)
  - [Writing a React Component](#writing-a-react-component)
  - [Store Reference](#store-reference)
  - [registerComponent reference](#registercomponent-reference)
  - [CSS for React Components](#css-for-react-components)
  - [plugin.js](#pluginjs)
  - [Camera Mode APIs](#camera-mode-apis)
  - [Game Time APIs](#game-time-apis)
  - [Communicating between plugin.js and index.jx](#communicating-between-pluginjs-and-indexjx)
  - [useStore advanced](#usestore-advanced)
  - [titan-reactor exports reference](#titan-reactor-exports-reference)
  - [README.md](#readmemd)
  - [Publishing Your Plugin](#publishing-your-plugin)
  - [Request For Plugin](#request-for-plugin)


## Overview

Plugins in Titan Reactor allow you to connect to the game to display custom charts, player scores, or anything you like.

- A plugin can use two methods to integrate with Titan Reactor, visual via React components, programmatic via game objects, or both.
- If you'd like to provide user configuration, Titan Reactor provides a configuration UI for the user to use based on your json "schema".

Please note that due to frequency of changes and lack of time these documents may be out of date or incomplete. It's recommended to start with an existing plugin and work from there.

## Your first plugin package.json

*plugins/my-cool-plugin/package.json*
```json
{
  "name": "@titan-reactor-plugin/my-cool-plugin",
  "description": "My Cool Plugin",
  "version": "1.0.0",
  "keywords": ["titan-reactor-plugin"],
  "peerDependencies": {
        "titan-reactor": "0.5.0"
  }
}
```

You'll first need a `package.json` under your plugin folder with at least a unique name and version. We use the [npm package.json spec](https://docs.npmjs.com/cli/v8/configuring-npm/package-json) for our conventions here. For your version number it is required you use semver `1.0.0`, `2.0.0` etc for updates. `peerDependencies` lets Titan Reactor know about compatibility.


## How it works

Your plugin directory must contain a `package.json` file. It may also contain either  `index.jsx` or `plugin.js` or both.

For React components use `index.jsx`. Your code will automatically be be transpiled by Titan Reactor. Your component will live in an iframe with other plugins in a separate process. You can show different components based on the screen (eg replay loading or replay active) and read *some* of Titan Reactor game state.

For more comprehensive processing use `plugin.js` which allows you to access full Titan Reactor game state on the main Chromium process. This will mostly be used for modifying game state, such as player colors. You can communicate with your React components as well if need be.

We use the `config` value in `package.json` to define user configuration options and default values. These settings will be shown to the user in the config window. We use Leva for this config window and so the values follow the [Leva convention](https://github.com/pmndrs/leva/blob/main/docs/inputs.md), you can see also their [storybook examples](https://leva.pmnd.rs/?path=/story/inputs-string--simple). 

```json
{
  "name": "@titan-reactor-plugin/my-cool-plugin",
  "description": "My Cool Plugin",
  "version": "1.0.0",
  "keywords": ["titan-reactor-plugin"]

   "config": {
      "userName": {
          "value": "this value will be modifiable by the user since I have a value property!"
      },
      "system": {
        "foo": "anything in the system object does not get shown to users and does not need a value field"
      }
    }
}
```
![image](https://user-images.githubusercontent.com/586716/160561170-b7eea6be-742e-4a8d-b21d-46f885d2b8bf.png)

## Writing a React Component

Once we've got our basic `package.json` we can start with `index.jsx`:

```jsx
import React from "react";
import { registerComponent, useFrame } from "titan-reactor";

const MyComponent = ({ config }) => {
    // will update on every game second with latest frame data
    const frame = useFrame();

    return <h1>Hello { config.userName.value }. Game time is {frame.time} </h1>
};

registerComponent({ pluginId: "_plugin_id_", screen: "@replay/ready" }, MyComponent);
```

`registerComponent` lets Titan Reactor know about our new React Component, and will mount it and unmount it according to the screen and layout rules. The `_plugin_id_` macro will be replaced with our actual unique plugin id for us and is just boilerplate.

Additional properties in the first argument allow us to tap into layout and screen rules. In this case **our React component will be mounted when the replay screen is ready (loaded), and unmounted on any other state**.

Your script will be treated by the browser as an ES6 module, meaning you have full access to the module system. Provided for you is an import map for `titan-reactor`, `react`, `react-dom` and `zustand`. You may import these with these names directly. You are free to import additional packages from services such as skypack, however it is recommended that you include files locally eg `import "./my-lib.js"`.

Every component will be provided with their plugin `config` object which corresponds with `config` field of our `package.json`. The component will re-render on any config update.

Note that only mouse clicks events (`onClick`) will be available for listening to any of your react components. This is due to a limitation with having a full screen iframe mostly non-interactable on-top of the game canvas.




## Store Reference

useFrame();

- **frame**
  - **time**: game time label `eg, "12:00"`
  - **frame**: current replay frame
  - **maxFrame**: max replay frame
  - **playerData**: raw player data, use `getPlayerInfo` utility to extract meaningful data
  - **unitProduction**: Int32Array for each player (8 total), with [unitId, count]
  - **upgrades**: Int32Array for each player (8 total), with [upgradeId, level, progress]
  - **research**: Int32Array for each player (8 total), with [researchId, progress]

useMap();
  - **map**: [Map](https://github.com/imbateam-gg/titan-reactor/blob/dev/src/common/types/declarations/bw-chk.d.ts#L21)

useReplay();
  - **replay**: [Replay](https://github.com/imbateam-gg/titan-reactor/blob/dev/src/renderer/process-replay/parse-replay.ts#L49)

useStore(); //generic
- **scene** : "screenType/screenStatus"
- **dimensions** [GameCanvasDimensions](https://github.com/imbateam-gg/titan-reactor/blob/dev/src/common/types/image.ts#L11)

## registerComponent reference

Example: 
```js
registerComponent({
  pluginId: "_plugin_id_",
  screen: "@home/ready",
  snap: "center"
}, MyElement)

```

**screen** = "screenType/screenStatus"
- screenType = `@home` | `@replay` | `@map`

- screenStatus = `loading` | `ready`

`@home/loading` is not available to plugins. if `screen` is omitted, the plugin channel will be mounted on `@home/ready` and will remain mounted until the application is closed.

**snap**
- `top` | `left` | `right` | `bottom` | `center`

If multiple components are snapped into the same location, we use `config.order.value` to determine an ordering. 

If multiple components are snapped to the center we provide a tabbing system.

If snap is omitted, positioning is upto the plugin author and the root node must have style `position: absolute`.

## CSS for React Components

The following css variables are available to your styles:
- --game-width
- --game-height
- --minimap-width
- --minimap-height

These additional font-families are available for your styles:

`Inter` the default body font.

`Conthrax` and `Conthrax-Bold` are good for scores and numbers.

Finally, included in the "runtime" environment is also the full set of open prop variables for use in your CSS. [See Open Props for more details.](https://open-props.style/)

## plugin.js

You can create really powerful plugins by using a `plugin.js` file that is loaded in the same process space as Titan Reactor itself. You can listen to hooks and modify scene and state objects, as well as create custom hooks for other plugins to listen to.

Checkout the [official plugins](https://github.com/imbateam-gg/titan-reactor-community) for several examples.

```js
// we provide global dependencies via the arguments object
const { THREE } = arguments;

// your plugin must return an object with keynames matching hook names that you want to listen to
return {
    // init() will be called on load if your plugin is already enabled
    // it will also be called anytime the user enables your plugin
    init() {
      // config property will be on the object
      console.log(this.config);
    },

    // Titan Reactor provides a UI for users to change config of your plugin
    // this hook fires anytime a user has changed a config field
    onConfigChanged(newConfig, oldConfig) {
      this.config === newConfig; // true;
    },

    // if the user disables your plugin, clean up!
    onDisabled() {

    },

    // onGameReady fires when everything is loaded but before the first frame is run
    // the apis provided allow you to iterate players and units, modify replay position and speed and other things
    async onGameReady() {
      
    },

    // when the game is over, get rid of any unneeded object references to the previous game!
    onGameDisposed() {

    },
    
    // These APIS are only available if 
}
```

## Camera Mode APIs

Your plugin is considered a camera mode if your config has a `cameraModeKey` setting. A camera mode is a controller for camera movement and rendering.

```json
"cameraModeKey": {
          "label": "Toggle Camera",
          "type": "keyboard-shortcut",
          "value": "F5"
      },
```

Additional callbacks are made available:
```js
// REQUIRED. When entering this camera mode.
async onEnterCameraMode(controls, minimapMouse, camera, mapWidth, mapHeight);

// When exiting the camera mode.
onExitCameraMode();

// When updating the mouse.
onCameraMouseUpdate(delta, elapsed, scrollY, screenDrag, lookAt, clicked);

// When updating the keyboard.
onCameraKeyboardUpdate(delta, elapsed, move) {

// Whether a unit should be hidden or not.
onShouldHideUnit(unit);

// The audio listener has a physical location, update it here.
onUpdateAudioMixerLocation(delta, elapsed, audioMixer, camera, target);
```



Additional properties for setting options:
```javascript
orbit: CameraControls; // the main controller for camera movement
minimap: true, // whether to display the minimap
pip: false, // whether to enable PIP
pointerLock: true, // whether to lock the pointer (FPS style mouse)
soundMode: "spatial", // either "classic" for stereo panning or "spatial" for 3d
boundByMap: true, // whether the camera target is bound to the map
```

CameraControls [documentation may be found here](https://github.com/yomotsu/camera-controls).


## Game Time APIs
When a game is started apis are made available to your plugin for that instance of the game.

Since this api is in very active development please refer to the source code for the time being.

Take special care not to keep references to objects from the game instance. Dereference any values via the `onGameDisposed` callback.

## Communicating between plugin.js and index.jx

You can messages from plugin.js to your react components. For a full working example see the official FPS plugin.

In your `index.jsx`:
```jsx
import React from "react";

// useMessage is a hook passed in as a prop for your component
const MyComponent = ({ config, useMessage, sendMessage }) => {

  // any messages sent from plugin.js are received here
  const message = useMessage();

  // here we just render the message, but you could also respond to events
  // and use sendMessage({bar: "foo"}) to respond
  return <p>{message.foo}</p>
});

```

In your `plugin.js`:
```js


return {
  onGameReady() {
    this.sendUIMessage({ foo : "bar!" });
  }

  // you may respond to ui sent messages here
  onUIMessage(message) {

  }
}
```

## useStore advanced

Titan Reactor provides a useStore hook for channels to access game state. This is a zustand store, [please see zustand for complete details](https://github.com/pmndrs/zustand). This brief section will illustrate two uses:

**Regular Use**
It's best to [keep the "selector" function memoized](https://github.com/pmndrs/zustand#memoizing-selectors) with useCallback or kept outside the function to minimize object allocation. If a selector isn't provided your component will re-render every game second since that is when `store.frame` gets updated which is the most frequently updated.

**Optimized (Transient) Use**

This method is a small optimization minimizing virtual dom diffing and re-renders. See [FPS Meter plugin](https://github.com/imbateam-gg/titan-reactor-community/tree/main/plugins/fps) and [Zustand documentation](https://github.com/pmndrs/zustand#transient-updates-for-often-occuring-state-changes).

## titan-reactor exports reference

- useStore
- getPlayerInfo
- assets
- RollingResource
- registerComponent
- pluginContentReady

## README.md

By including a README.md Titan Reactor will include a Readme tab in the config window.

## Publishing Your Plugin

In order to make your plugin available to others, simply publish your package to `npm` and ensure you have `titan-reactor-plugin` in keywords. If you'd like to publish under the official **@titan-reactor-plugins** scope please see the [Titan Reactor Plugins](https://github.com/imbateam-gg/titan-reactor-community) repository.

## Request For Plugin

This is a list of plugins that I'd personally like to see come to life by the community:

- Day/night cycle
- Battle review
  - After a battle calculate tally dead, score, etc.
- Player renamer
- Player intros
  - Camera macro
  - Race / Name animations
- Player/matchup/map data sheets
- Replay and map repositories
- Camera macros
- Replay autoupload
- Replay loading screens
- Player alias database
- Twitch integrations
  - sponsor a unit with bits, sponsored unit scorecard at end of game (kills, etc.)
- Commercial sponsor integrations into map
