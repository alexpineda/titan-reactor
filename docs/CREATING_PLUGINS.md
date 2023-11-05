# Table of Contents

- [Table of Contents](#table-of-contents)
  - [Overview](#overview)
  - [Getting Started](#getting-started)
    - [Plugin Files](#plugin-files)
    - [Allowing For User Configuration](#allowing-for-user-configuration)
  - [React Plugin](#react-plugin)
    - [registerComponent()](#registercomponent)
    - [CSS](#css)
  - [Host Plugin](#host-plugin)
    - [Hooks](#hooks)
    - [Scene Controller Plugins](#scene-controller-plugins)
    - [Communicating between Game and your UI component](#communicating-between-game-and-your-ui-component)
  - [Additional Information](#additional-information)
    - [README.md](#readmemd)
    - [Deprecating Your Plugin](#deprecating-your-plugin)
    - [Publishing Your Plugin](#publishing-your-plugin)

ℹ️ Plugin API Version is presently `2.0.0`

ℹ️ For API Type documentation visit [the Plugin API documentation](https://imbateam-gg.github.io/titan-reactor/).

ℹ️ Checkout the [official plugins](https://github.com/imbateam-gg/titan-reactor-official-plugins) for several examples.


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
        "titan-reactor-runtime/ui": "2.0.0",
        "titan-reactor-runtime/host": "2.0.0"
    }
}
```

> We use the [npm package.json](https://docs.npmjs.com/cli/v8/configuring-npm/package-json) for our conventions here. `titan-reactor-runtime` is used for UI plugins and contains type definitions. `titan-reactor-host` is used for native plugins.

### Plugin Files

Aside from the `package.json` file, there may also be either `index.tsx` or `plugin.ts` or both.


![image](https://github.com/alexpineda/titan-reactor/assets/586716/903f309b-e2c1-438a-a301-44d0d3a86a06)
An example plugin directory structure.


-   **(Host Plugin)** The `index.ts` file is runs in the same process as the game loop and is for sophisticated logic.
-   **(React Plugin)** The `components/index.tsx` file is for primarily for your UI components, which live in an iframe with other plugins in a separate UI process.

> Your React plugin will be treated by the browser as an ES6 module, meaning you have full access to the ES6 module system. You are free to import additional packages from services such as [skypack](https://esm.sh/) or have them bundled with `titan-plugin-cli`. Only mouse clicks events (`onClick`) will be available for listening to any of your react components.

> For your host plugin, core dependencies are provided in the globalThis object such as `THREE`, `postprocessing`, and more.

### Allowing For User Configuration

We use the `config` value in `package.json` to define user configuration options and default values. Titan Reactor will then provide the UI to modify these settings to the user _(via Command Center)_.

> We use Leva for this config window and so the values follow the [Leva convention](https://github.com/pmndrs/leva/blob/main/docs/inputs.md), you can see also their [storybook examples](https://leva.pmnd.rs/?path=/story/inputs-string--simple).

```json
{
    "name": "@titan-reactor-plugin/my-cool-plugin",
    "description": "My Cool Plugin",
    "version": "1.0.0",
    "keywords": ["titan-reactor-plugin"],
    "peerDependencies": {
        "titan-reactor-runtime": "2.0.0",
        "titan-reactor-host": "2.0.0"
    },
    "config": {
        "userName": {
            "value": "this value will be modifiable by the user since I have a value property!"
        }
    }
}
```

![image](https://user-images.githubusercontent.com/586716/160561170-b7eea6be-742e-4a8d-b21d-46f885d2b8bf.png)

## React Plugin

Once we've got our basic `package.json` we can start with `index.tsx`:

```jsx
import React from "react";
import { usePluginConfig, useFrame, getFriendlyTime } from "titan-reactor-runtime/ui";

const MyComponent = () => {

    // will update any time the user changes config
    const config = usePluginConfig();
    // will update on every game second with latest frame data
    const frame = useFrame();

    return <h1>Hello { config.userName }. Game time is {getFriendlyTime(frame) </h1>
};

registerComponent({ snap: "left" }, MyComponent);
```

> Calling `registerComponent` lets Titan Reactor know about our new React Component.

### registerComponent()

Example:

```js
registerComponent(
    {
        snap: "center",
        order: 0,
    },
    MyElement
);
```

**snap** _(optional)_

`top` | `left` | `right` | `bottom` | `center`

-   If multiple components are snapped to the center we provide a tabbing system.

-   If snap is omitted, positioning is upto the plugin author and the root node must have style `position: absolute`.

**order** (optional)

-   If multiple components are snapped into the same location, we use `order` to determine an ordering.
-   Defaults to 0

### CSS

The following font-families are available to your styles:

-   `Inter` the default body font.

-   `Conthrax` and `Conthrax-Bold` are good for scores and numbers.

The following css variables are available to your styles:

-   `--minimap-width` and `--minimap-height`

> If the minimap is not visible minimap-height will go to 0.

Open Props is also made available.

> [See Open Props for more details.](https://open-props.style/)

## Host Plugin

When a game is started apis are made available to your Host plugin for that instance of the game. Your plugin runs in a sandboxed container so most browser APIs will not be available.

> Your `plugin.ts` is loaded in the same process space as Titan Reactor itself. You can listen to hooks and modify scene and state objects, as well as create custom hooks for other plugins to listen to.

### Hooks

Every host plugin can react to hooks.

> Full documentation is available via typings.

```ts
import { PluginBase } from "titan-reactor-host";

// global dependencies are made available
// THREE - three.js
// STDLIB - additional three.js objects
// postprocessing - from the `postprocessing` npm package
// enums - several Starcraft constants and enums like unitTypes and orderTypes

// your plugin must return an object with keynames matching hook names that you want to listen to
export default class Plugin extends PluginBase {
    // init fires when everything is loaded but before the first frame is run
    async init() {}

    // Titan Reactor provides a UI for users to change config of your plugin
    // this hook fires anytime a user has changed a config field
    onConfigChanged(oldConfig) {
        // in this example we use goToFrame api call to jump to a user changed config value
        if (this.config.jumpToFrame !== oldConfig.jumpToFrame) {
            this.goToFrame(this.config.jumpToFrame);
        }
    }

    // when the plugin is reloaded, disabled, or when the current game/map is over
    dispose() {}

    // every bw game frame
    // frame - the frame number
    // commands - an array of replay commands
    // note some frames may be skipped for fps reasons
    // commands will include upto 5s of skipped frames
    onFrame(frame, commands) {}
}
```

### Scene Controller Plugins

A scene controller is a special plugin that responds to user input in order to change camera positions and transitions.

> Unlike regular plugins, hooks won't be executed unless the scene is active, including the regular plugin hooks.

```ts
export default class PluginAddon extends SceneController implements SceneController {

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

-   See the [`SceneControllerPlugin` type for full API documentation](https://github.com/imbateam-gg/titan-reactor/blob/dev/src/common/types/plugin.ts).

-   The `orbit` object is an instance of [CameraControls](https://github.com/yomotsu/camera-controls).

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
import { PluginBase } from "titan-reactor-host";

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

> Your messages may be throttled due to them needing to be serialized and sent via `window.postMessage` to the iframe container. It is recommended you reduce how much you send messages across to the bare minimum.


## Additional Information

### README.md

By including a README.md Titan Reactor will include a Readme tab in the users configuration window.

### Deprecating Your Plugin

If you wish to decommission your plugin you may mark a release as deprecated by adding `deprecated` to the keywords in `package.json`.

### Publishing Your Plugin

In order to make your plugin available to others, simply publish your package to `npm` and ensure you have `titan-reactor-plugin` in keywords. If you'd like to publish under the official **@titan-reactor-plugins** scope please see the [Titan Reactor Plugins](https://github.com/imbateam-gg/titan-reactor-community) repository.
