# Table of Contents
- [Table of Contents](#table-of-contents)
  - [Overview](#overview)
  - [Getting Started](#getting-started)
    - [Plugin Files](#plugin-files)
    - [Allowing For User Configuration](#allowing-for-user-configuration)
  - [React Plugin](#react-plugin)
    - [Runtime API Reference](#runtime-api-reference)
    - [registerComponent()](#registercomponent)
    - [CSS](#css)
  - [Host Plugin](#host-plugin)
    - [Hooks](#hooks)
    - [Custom Hooks](#custom-hooks)
    - [Scene Controller Plugins](#scene-controller-plugins)
    - [Communicating between Game and your UI component](#communicating-between-game-and-your-ui-component)
  - [Special Permissions](#special-permissions)
  - [Additional Information](#additional-information)
    - [README.md](#readmemd)
    - [Deprecating Your Plugin](#deprecating-your-plugin)
    - [Publishing Your Plugin](#publishing-your-plugin)

⚠️ The plugin API is under heavy development. Expect frequent breaking changes until Titan Reactor v1. Plugin API Version is presently `2.0.0`

Checkout the [official plugins](https://github.com/imbateam-gg/titan-reactor-official-plugins) for several examples.


## Overview

Plugins in Titan Reactor allow you to display custom charts, messages, player scores, control cameras, change player colors, etc. Plugins are written using Javascript/JSX or TypeScript/TSX. 
> For the sake of clarity we will assume TypeScript is being used for the remainder of the documentation.

## Getting Started

You'll first need a `package.json` file under your plugin folder with at least a unique name and version.  

```json
{
  "name": "@titan-reactor-plugin/my-cool-plugin",
  "description": "My Cool Plugin",
  "version": "1.0.0",
  "keywords": ["titan-reactor-plugin"],
  "peerDependencies": {
        "titan-reactor-api": "2.0.0"
  }
}
```
> We use the [npm package.json](https://docs.npmjs.com/cli/v8/configuring-npm/package-json) for our conventions here. `peerDependencies` lets Titan Reactor know about compatibility.
> 


### Plugin Files

Aside from the `package.json` file, there may also be either  `index.tsx` or `plugin.ts` or both. 
- **(React Plugin)** The `index.tsx` file  is for UI components, which live in an iframe with other plugins in a separate UI process.  
- **(Host Plugin)** The `plugin.ts` file is for processing & communicating additional data to your UI if needed.

> Your React plugin will be treated by the browser as an ES6 module, meaning you have full access to the ES6 module system. You are free to import additional packages from services such as skypack, however it is recommended that you include files locally eg `import "./my-lib.js"`. Only mouse clicks events (`onClick`) will be available for listening to any of your react components.

> Your Host plugin will be in a strict container since it's in the same process as the game . Core dependencies are provided in the environment already such as `THREE`, `postprocessing`, and more. If you need other dependencies it would be best to build them in using a 3rd party bundler

### Allowing For User Configuration

We use the `config` value in `package.json` to define user configuration options and default values. Titan Reactor will then provide the UI to modify these settings to the user *(via Command Center)*. 

> We use Leva for this config window and so the values follow the [Leva convention](https://github.com/pmndrs/leva/blob/main/docs/inputs.md), you can see also their [storybook examples](https://leva.pmnd.rs/?path=/story/inputs-string--simple). 

```json
{
  "name": "@titan-reactor-plugin/my-cool-plugin",
  "description": "My Cool Plugin",
  "version": "1.0.0",
  "keywords": ["titan-reactor-plugin"],
  "peerDependencies": {
        "titan-reactor-api": "2.0.0"
    },
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

## React Plugin

Once we've got our basic `package.json` we can start with `index.tsx`:

```jsx
import React from "react";
import { usePluginConfig, useFrame, getFriendlyTime } from "titan-reactor/runtime";

const MyComponent = () => {

    // will update any time the user changes config
    const config = usePluginConfig();
    // will update on every game second with latest frame data
    const frame = useFrame();

    return <h1>Hello { config.userName }. Game time is {getFriendlyTime(frame.frame)} </h1>
};

registerComponent({ screen: "@replay", snap: "left" }, MyComponent);
```

> Calling `registerComponent` lets Titan Reactor know about our new React Component. The screen rule causes the component to mount or unmount it according to the screen which can be either `@replay` or `@map`.


### Runtime API Reference

> It's recommended to use TypeScript to get upto date typing and reference.

**usePluginConfig()**
- Get this plugins configuration values

**useFrame()**

- **frame**
  - **frame**: current replay frame
  - **playerData**: raw player data, use `usePlayerFrame` utility to extract meaningful data
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

**useSelectedUnits()**
- Provides Unit objects if any are presently selected

**getUnitIcon(unit)**
- Pass in a selected unit to get the correct icon id to use with `assets.cmdIcons`

**useProduction**
- returns `[getUnits, getUpgrades, getResearch]` where each can be used to get player production information eg `getUnits(player.id)`
  
**useStyleSheet(content)**
- Set a global stylesheet

**useMessage()**
- Recieve messages from your plugin.js

**useSendMessage()**
- Send messages to your plugin.js
- provides function `sendMessage(content)`

**getFriendlyTime(frame)**
- Converts a game frame to a time label like 12:01

**RollingResource**
- A component that rolls to a number in an animated fashion

**assets**
- A full set of game assets like icons (mostly in base64) and DAT information
- See the [Assets](https://github.com/imbateam-gg/titan-reactor/blob/dev/src/renderer/assets/assets.ts) type for reference

**enums**
- A full set of game enums like unit types
- See the [enums](https://github.com/imbateam-gg/titan-reactor/tree/dev/src/common/enums) folder for reference

### registerComponent()

Example: 
```js
registerComponent({
  screen: "@replay/ready",
  snap: "center",
  order: 0
}, MyElement)

```

**screen** = `@replay` | `@map`

**snap** *(optional)*

`top` | `left` | `right` | `bottom` | `center`

- If multiple components are snapped to the center we provide a tabbing system.

- If snap is omitted, positioning is upto the plugin author and the root node must have style `position: absolute`.

**order** (optional)

- If multiple components are snapped into the same location, we use `order` to determine an ordering. 
- Defaults to 0


### CSS

The following font-families are available to your styles:

- `Inter` the default body font.

- `Conthrax` and `Conthrax-Bold` are good for scores and numbers.


The following css variables are available to your styles:

- `--minimap-width` and `--minimap-height`

> If the minimap is not visible minimap-height will go to 0.

Open Props is also made available.

> [See Open Props for more details.](https://open-props.style/)



## Host Plugin
When a game is started apis are made available to your Host plugin for that instance of the game.

Since this api is in very active development [please refer to the source code](https://github.com/imbateam-gg/titan-reactor/blob/dev/src/renderer/scenes/replay/replay-scene.ts#L83) for the time being. An npm type package will soon be made available.

> Your `plugin.ts` is loaded in the same process space as Titan Reactor itself. You can listen to hooks and modify scene and state objects, as well as create custom hooks for other plugins to listen to.


### Hooks

Every host plugin can react to hooks.

> Full documentation is available via typings.


```ts
import { PluginBase } from "titan-reactor/host";

// global dependencies are made available
// THREE - three.js
// STDLIB - additional three.js objects
// postprocessing - from the `postprocessing` npm package

// your plugin must return an object with keynames matching hook names that you want to listen to
export default class Plugin extends PluginBase {
    
    // onSceneReady fires when everything is loaded but before the first frame is run
    async onSceneReady() {
      
    }

    // Titan Reactor provides a UI for users to change config of your plugin
    // this hook fires anytime a user has changed a config field
    onConfigChanged(oldConfig) {
      // in this example we use goToFrame api call to jump to a user changed config value
      if (this.config.jumpToFrame !== oldConfig.jumpToFrame) {
        this.goToFrame(this.config.jumpToFrame)
      }
    }

    
    // when the game is over, get rid of any unneeded object references to the previous game!
    onSceneDisposed() {

    }

    // every bw game frame
    // frame - the frame number
    // commands - an array of replay commands
    // note some frames may be skipped for fps reasons
    // commands will include upto 5s of skipped frames
    onFrame(frame,  commands) {

    }


    dispose() {
      // user disabled your plugin 
    }
    
}
```

### Custom Hooks

Custom hooks must start with `onCustom...`;

```js
onFrame() {
  if (this.currentFrame > this.maxFrame - 100) {
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

### Scene Controller Plugins

A scene controller is a special plugin that responds to user input in order to change camera positions and transitions.

> Unlike regular plugins, hooks won't be executed unless the scene is active, including the regular plugin hooks.

```ts
import { SceneController } from "titan-reactor/host";


export default class PluginAddon extends SceneController implements SceneController {

// REQUIRED
gameOptions = {
    audio: "3d" as const,
}

// REQUIRED.
async onEnterScene(prevSceneExitData) {
  // try our best to transition the camera location
  // to the previous target for this scene
  if (prevSceneExitData?.target?.isVector3) {
        this.viewport.orbit.setTarget(prevSceneExitData.target.x, 0, prevSceneExitData.target.z, false);
    } else {
        this.viewport.orbit.setTarget(0, 0, 0, false);
    }
}

// here we pass along target to the next scene
// the current target and position of the camera is provided
// for convenience
onExitScene(target, position) {
  return {
    target, 
    position
  };
}

// When updating the mouse.
onCameraMouseUpdate(delta, elapsed, scrollY, screenDrag, lookAt, mouse, clientX, clientY, clicked);

// ...

```

- See the [`SceneControllerPlugin` type for full API documentation](https://github.com/imbateam-gg/titan-reactor/blob/dev/src/common/types/plugin.ts).

- The `orbit` object is an instance of [CameraControls](https://github.com/yomotsu/camera-controls).




### Communicating between Game and your UI component

You can send messages back and forth to your react components.

In your `index.tsx`:
```tsx
import React from "react";
import { useMessage, useSendMessage } from "titan-reactor/runtime";

const MyComponent = ({ config }) => {

  const sendMessage = useSendMessage();

  // host plugin sent a message
  useMessage(incomingMessage => {
    console.log(incomingMessage);
  });

  // send a message to host
  return <p onClick={() => sendMessage("To Host plugin")}>Send to host</p>
});

```

In your `plugin.ts`:
```ts
import { PluginBase } from "titan-reactor/host";

export default class Plugin extends PluginBase {
  onSceneReady() {
    // send message to react plugin
    this.sendUIMessage("Hello React plugin, from host.");
  }

  // react plugin sent a message
  onUIMessage(message) {
    console.log(message);
  }
}
```

>Your messages may be throttled due to them needing to be serialized and sent via `window.postMessage` to the iframe container. It is recommended you reduce how much you send messages across to the bare minimum.

## Special Permissions

There are certain features that require you to request special permissions. The user will be able to see your special permissions before enabling your plugin. 
> Typical things requiring permission are saving user settings or reading complete replay data.

In order to activate a permission, place it in your config.json like so:

```json
    "config": {
        "system": {
            "permissions": [
                "replay.commands"
            ]
        }
    }
```

**replay.commands**
Enables access to replay commands in the *onFrame()* hook.

## Additional Information
### README.md

By including a README.md Titan Reactor will include a Readme tab in the users configuration window.

### Deprecating Your Plugin

If you wish to decommission your plugin you may mark a release as deprecated by adding `deprecated` to the keywords in `package.json`.

### Publishing Your Plugin

In order to make your plugin available to others, simply publish your package to `npm` and ensure you have `titan-reactor-plugin` in keywords. If you'd like to publish under the official **@titan-reactor-plugins** scope please see the [Titan Reactor Plugins](https://github.com/imbateam-gg/titan-reactor-community) repository.