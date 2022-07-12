# Table of Contents
- [Table of Contents](#table-of-contents)
  - [Overview](#overview)
  - [Basic Plugin Information](#basic-plugin-information)
    - [package.json](#packagejson)
  - [How it works](#how-it-works)
    - [Required Files](#required-files)
    - [UI Component](#ui-component)
    - [Game Component](#game-component)
    - [System and User Configuration](#system-and-user-configuration)
  - [Writing a React Component](#writing-a-react-component)
    - [Example](#example)
    - [registerComponent()](#registercomponent)
    - [Technology](#technology)
    - [Using User Configuration](#using-user-configuration)
    - [Interaction](#interaction)
  - [React API Reference](#react-api-reference)
  - [More on registerComponent()](#more-on-registercomponent)
  - [CSS for React Components](#css-for-react-components)
    - [CSS Variables](#css-variables)
    - [Included Font Families](#included-font-families)
  - [Modifying Game State](#modifying-game-state)
    - [Game Time APIs](#game-time-apis)
    - [Hooks](#hooks)
  - [Camera Mode Plugins](#camera-mode-plugins)
  - [Custom Hooks](#custom-hooks)
  - [Communicating between Game and your UI component](#communicating-between-game-and-your-ui-component)
    - [Message Throttling](#message-throttling)
  - [Special Permissions](#special-permissions)
  - [README.md](#readmemd)
  - [Publishing Your Plugin](#publishing-your-plugin)
  - [Request For Plugin](#request-for-plugin)

⚠️ The plugin API is under heavy development. Expect frequent breaking changes until Titan Reactor v1. Big plans include supporting TypeScript out of the box.

Checkout the [official plugins](https://github.com/imbateam-gg/titan-reactor-official-plugins) for several examples.


## Overview

Plugins in Titan Reactor allow you to connect to the game to display custom charts, player scores, or anything you like. Plugins are written using Javascript and/or JSX.

- A plugin can use two methods to integrate with Titan Reactor, visual via React components, programmatic via game objects, or both.
- If you'd like to provide user configuration, Titan Reactor provides a configuration UI for the user.


## Basic Plugin Information

### package.json

*plugins/my-cool-plugin/package.json*
```json
{
  "name": "@titan-reactor-plugin/my-cool-plugin",
  "description": "My Cool Plugin",
  "version": "1.0.0",
  "keywords": ["titan-reactor-plugin"],
  "peerDependencies": {
        "titan-reactor-api": "1.0.0"
  }
}
```

You'll first need a `package.json` under your plugin folder with at least a unique name and version. We use the [npm package.json spec](https://docs.npmjs.com/cli/v8/configuring-npm/package-json) for our conventions here. For your version number it is required you use semver `1.0.0`, `2.0.0` etc for updates. `peerDependencies` lets Titan Reactor know about compatibility.


## How it works

### Required Files

Your plugin directory must contain a `package.json` file. It may also contain either  `index.jsx` or `plugin.js` or both.

### UI Component

For React UI components use `index.jsx`. Your code will automatically be be transpiled by Titan Reactor. Your component will live in an iframe with other plugins in a separate process. You can show different components based on the screen (eg replay loading or replay active) and read *some* of Titan Reactor game state.

### Game Component

For more comprehensive processing use `plugin.js` which allows you to access full Titan Reactor game state on the main Chromium process. This will mostly be used for modifying game state, such as player colors. You can communicate with your React components as well if need be.

### System and User Configuration

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

### Example

Once we've got our basic `package.json` we can start with `index.jsx`:

```jsx
import React from "react";
import { registerComponent, usePluginConfig, useFrame } from "titan-reactor";

const MyComponent = () => {

    // will update any time the user changes config
    const config = usePluginConfig();
    // will update on every game second with latest frame data
    const frame = useFrame();

    return <h1>Hello { config.userName }. Game time is {frame.time} </h1>
};

registerComponent({ pluginId: "_plugin_id_", screen: "@replay/ready" }, MyComponent);
```

### registerComponent()

`registerComponent` lets Titan Reactor know about our new React Component, and will mount it and unmount it according to the screen and layout rules. The `_plugin_id_` macro will be replaced with our actual unique plugin id for us and is just boilerplate.

### Technology

Your script will be treated by the browser as an ES6 module, meaning you have full access to the module system. Provided for you is an import map for `titan-reactor`, `react`, `react-dom` and `zustand`. You may import these with these names directly. You are free to import additional packages from services such as skypack, however it is recommended that you include files locally eg `import "./my-lib.js"`.

### Using User Configuration

Every component will be provided with their plugin `config` object which corresponds with `config` field of our `package.json`. The component will re-render on any config update.

### Interaction

Only mouse clicks events (`onClick`) will be available for listening to any of your react components. This is due to a limitation with having a full screen iframe mostly non-interactable on-top of the game canvas.

## React API Reference

`titan-reactor` exports several utility methods, components and hooks.

**usePluginConfig()**
- Get this plugins configuration values

**useFrame()**

- **frame**
  - **time**: game time label `eg, "12:00"`
  - **frame**: current replay frame
  - **maxFrame**: max replay frame
  - **playerData**: raw player data, use `getPlayerInfo` utility to extract meaningful data
  - **unitProduction**: Int32Array for each player (8 total), with [unitId, count]
  - **upgrades**: Int32Array for each player (8 total), with [upgradeId, level, progress]
  - **research**: Int32Array for each player (8 total), with [researchId, progress]

**useMap()**
  - **map**: [Map](https://github.com/imbateam-gg/titan-reactor/blob/dev/src/common/types/declarations/bw-chk.d.ts#L21)

**useReplay()**
  - **replay**: [Replay](https://github.com/imbateam-gg/titan-reactor/blob/dev/src/renderer/process-replay/parse-replay.ts#L49)

**usePlayers()**
 - Convenience function for accessing `replay.header.players`

**usePlayerFrame()**
 - provides function `getPlayerInfo(playerId)` to get frame based information like minerals and gas.

**usePlayer()**
- Convenience function to retrieve a particular player from `replay.header.players`
- provides function `getPlayer(playerId)`

**useStyleSheet(content)**
- Set a global stylesheet

**useMessage()**
- Recieve messages from your plugin.js

**useSendMessage()**
- Send messages to your plugin.js
- provides function `sendMessage(content)`

**RollingResource**
- A component that rolls to a number in an animated fashion

**assets**
- A full set of game assets like icons (mostly in base64)
- See the [Assets](https://github.com/imbateam-gg/titan-reactor/blob/dev/src/renderer/assets/assets.ts) type for reference
- You must check `assets.ready`
- eg.
  ```js
        if (!assets.ready) {
        return null;
      }
  ```

**enums**
- A full set of game enums like unit types
- See the [enums](https://github.com/imbateam-gg/titan-reactor/tree/dev/src/common/enums) folder for reference

## More on registerComponent()

Example: 
```js
registerComponent({
  pluginId: "_plugin_id_",
  screen: "@replay/ready",
  snap: "center",
  order: 0
}, MyElement)

```

**screen** *(optional)* = "screenType/screenStatus"

screenType = `@replay` | `@map`

screenStatus = `loading` | `ready`

- eg. "@replay/loading"

**snap** *(optional)*

`top` | `left` | `right` | `bottom` | `center`

- If multiple components are snapped to the center we provide a tabbing system.

- If snap is omitted, positioning is upto the plugin author and the root node must have style `position: absolute`.

**order** (optional)

- If multiple components are snapped into the same location, we use `order` to determine an ordering. 
- Defaults to 0


## CSS for React Components

### CSS Variables

The following css variables are available to your styles:

`--minimap-width`

`--minimap-height`

- If the minimap is not visible minimap-height will go to 0.

The full set of open prop variables for use in your CSS. [See Open Props for more details.](https://open-props.style/)


### Included Font Families

`Inter` the default body font.

`Conthrax` and `Conthrax-Bold` are good for scores and numbers.



## Modifying Game State
You can create really powerful plugins by using a `plugin.js` file that is loaded in the same process space as Titan Reactor itself. You can listen to hooks and modify scene and state objects, as well as create custom hooks for other plugins to listen to.

### Game Time APIs
When a game is started apis are made available to your plugin for that instance of the game.

- eg. `gotoFrame(frame)`
  
Since this api is in very active development [please refer to the source code](https://github.com/imbateam-gg/titan-reactor/blob/dev/src/renderer/view-replay.ts#L1635) for the time being.

Take special care not to keep references to objects from the game instance. Dereference any values via the `onGameDisposed` callback.



### Hooks

Every plugin gets a base set of hooks.


```js
// we provide global dependencies via the arguments object
// THREE - three.js
// STDLIB - additional three.js objects
// postprocessing - from the `postprocessing` npm package
const { THREE, STDLIB, postprocessing } = arguments[0];

// your plugin must return an object with keynames matching hook names that you want to listen to
return {
    // onPluginCreated() will be called on load if your plugin is already enabled
    // it will also be called anytime the user enables your plugin
    onPluginCreated() {
      // config property will be on the object
      console.log(this.config);
    },

    onPluginDisposed() {
      // user disabled your plugin
    },

    // Titan Reactor provides a UI for users to change config of your plugin
    // this hook fires anytime a user has changed a config field
    onConfigChanged(oldConfig) {
      // in this example we use goToFrame api call to jump to a user changed config value
      if (this.config.jumpToFrame !== oldConfig.jumpToFrame) {
        this.goToFrame(this.config.jumpToFrame)
      }
    },

    // onGameReady fires when everything is loaded but before the first frame is run
    // the apis provided allow you to iterate players and units, modify replay position and speed and other things
    async onGameReady() {
      
    },

    // when the game is over, get rid of any unneeded object references to the previous game!
    onGameDisposed() {

    },

    // every bw game frame
    // frame - the frame number
    // followingUnits - any units the user is following with the F key
    // commands - an array of replay commands
    // not some frames may be skipped for fps reasons
    // commands will include upto 5s of skipped frames
    onFrame(frame, followingUnits, commands) {

    }
    
}
```

## Camera Mode Plugins

Your plugin is considered a camera mode if your config has a `cameraModeKey` setting. A camera mode is a controller for camera movement and rendering.

In order to avoid bugs, special care must be taken to check `isActiveCameraMode` when doing work in non-camera mode hooks like `onConfigChanged()` or `onFrame()`.


```json
"cameraModeKey": {
          "label": "Toggle Camera",
          "type": "keyboard-shortcut",
          "value": "F5"
      },
```

Camera Mode Plugins get an additional set of hooks.

```js
// REQUIRED.
// The previous camera mode may leave data behind
// for smoother transitions between modes
async onEnterCameraMode(prevData);

// The camera target and position for convenience 
// in case we wish to pass this info along to the
// next camera mode.
onExitCameraMode(target, position);

// When updating the mouse.
onCameraMouseUpdate(delta, elapsed, scrollY, screenDrag, lookAt, mouse, clientX, clientY, clicked);

// ...

```

- See the [`CameraModePlugin` type for full API documentation](https://github.com/imbateam-gg/titan-reactor/blob/dev/src/renderer/input/camera-mode.ts).

- The `orbit` object is an instance of [CameraControls](https://github.com/yomotsu/camera-controls).


## Custom Hooks

Custom hooks must start with `onCustom...`;

```js
onGameReady() {
  this.registerCustomHook("onCustomPing");
},

onFrame() {
  if (this.getFrame() > this.maxFrame - 100) {
    this.callCustomHook("onCustomPing");
  }
}
```

In another plugin. We could also respond by returning a value or reading `this.context` to read other plugins values in the chain.
```js
onCustomPing() {
  console.log("pong")
}
```

## Communicating between Game and your UI component

You can send messages back and forth to your react components.

In your `index.jsx`:
```jsx
import React, { useState, useMessage, useSendMessage } from "react";

// useMessage is a hook passed in as a prop for your component
const MyComponent = ({ config }) => {

  const sendMessage = useSendMessage();

  // any messages sent from plugin.js are received here
  useMessage(incomingMessage => {
    console.log(incomingMessage);
  });

  return <p onClick={() => sendMessage("Hi!")}>Say Hi</p>
});

```

In your `plugin.js`:
```js


return {
  onGameReady() {
    this.sendUIMessage("Word.");
  },

  // you may respond to ui sent messages here
  onUIMessage(message) {
    console.log(message);
  }
}
```


### Message Throttling

`sendUIMessage` is expensive due to the object needing to be serialized and sent via `window.postMessage` to the iframe container. For this reason we automatically throttle messages to one every 100ms and it is recommended you reduce how much you send messages across to the bare minimum (eg one every game second).

## Special Permissions

There are certain features that require you to request special permissions. The user will be able to see your special permissions before enabling your plugin. Typical things requiring permission are saving user settings or readying complete replay data, as some players may be sensitive about plugins reading this information. In order to activate a permission, place it in your config.json like so:

```json
    "config": {
        "system": {
            "permissions": [
                "settings.write"
            ]
        }
    }
```

**settings.write**
Enables the `saveSettings` api to save app settings.

**replay.commands**
Enables access to replay commands in the *onFrame()* hook.

## README.md

By including a README.md Titan Reactor will include a Readme tab in the config window.

## Publishing Your Plugin

In order to make your plugin available to others, simply publish your package to `npm` and ensure you have `titan-reactor-plugin` in keywords. If you'd like to publish under the official **@titan-reactor-plugins** scope please see the [Titan Reactor Plugins](https://github.com/imbateam-gg/titan-reactor-community) repository.

## Request For Plugin

This is a list of plugins that I'd personally like to see come to life by the community:

- Day/night cycle
- Battle review
  - After a battle calculate tally dead, score, etc.
- Player/matchup/map data sheets
- Replay and map repositories
- Extra blood / particles / explosions / smoke
- Camera macros / Player intros (eg intro player1, intro player 2)
- Replay autoupload
- Replay loading screens
- Player alias database
- Twitch integrations
  - sponsor a unit with bits, sponsored unit scorecard at end of game (kills, etc.)
- Commercial sponsor integrations into map
- Player renamer
- Units lost
- Build order display
  - clicking on a item in the build order will jump the replay to that spot.
- Marker / Scribbling Tool