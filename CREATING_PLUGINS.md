# Table of Contents
- [Table of Contents](#table-of-contents)
  - [Overview](#overview)
  - [Your first plugin package.json](#your-first-plugin-packagejson)
  - [How it works](#how-it-works)
  - [Writing a React Component](#writing-a-react-component)
  - [Store Reference](#store-reference)
  - [registerComponent reference](#registercomponent-reference)
  - [CSS for React Components](#css-for-react-components)
  - [native.js](#nativejs)
  - [Communicating between native.js and index.jx](#communicating-between-nativejs-and-indexjx)
  - [useStore advanced](#usestore-advanced)
  - [titan-reactor exports reference](#titan-reactor-exports-reference)
  - [Publishing Your Plugin](#publishing-your-plugin)
  - [Request For Plugin](#request-for-plugin)


## Overview

Plugins in Titan Reactor allow you to connect to the game to display custom charts, player scores, or anything you like.

- A plugin can use two methods to integrate with Titan Reactor, visual via React components, programmatic via game objects, or both.
- If you'd like to provide user configuration, Titan Reactor provides a configuration UI for the user to use based on your json "schema".

## Your first plugin package.json

*plugins/my-cool-plugin/package.json*
```json
{
  "name": "@titan-reactor-plugin/my-cool-plugin",
  "description": "My Cool Plugin",
  "version": "1.0.0",
  "keywords": ["titan-reactor-plugin"]
}
```

You'll first need a `package.json` under your plugin folder with at least a unique name and version. We use the [npm package.json spec](https://docs.npmjs.com/cli/v8/configuring-npm/package-json) for our conventions here. For your version number it is required you use semver `1.0.0`, `2.0.0` etc for updates. 


## How it works

Your plugin directory must contain a `package.json` file. It may also contain either  `index.jsx` or `native.js` or both.

For React components use `index.jsx`. Your code will automatically be be transpiled by Titan Reactor. Your component will live in an iframe with other plugins in a separate process. You can show different components based on the screen (eg replay loading or replay active) and read *some* of Titan Reactor game state.

For more comprehensive processing use `native.js` which allows you to access full Titan Reactor game state on the main Chromium process. This will mostly be used for modifying game state, such as player colors. You can communicate with your React components as well if need be.

We use the `config` value in `package.json` to define user configuration options and default values. These settings will be shown to the user in the config window. We use Leva for this config window and so the values follow the [Leva convention](https://github.com/pmndrs/leva/blob/main/docs/inputs.md), you can see also their [storybook examples](https://leva.pmnd.rs/?path=/story/inputs-string--simple). 

```json
{
  "name": "@titan-reactor-plugin/my-cool-plugin",
  "description": "My Cool Plugin",
  "version": "1.0.0",
  "keywords": ["titan-reactor-plugin"]

   "config": {
      "userName": {
          "value": "this value can be changed by the user since I have a value property!"
      },
      "privateProp": "this prop can be considered `private` and not for user consumption since it is not an object and does not have a value property"
    }
}
```
![image](https://user-images.githubusercontent.com/586716/160561170-b7eea6be-742e-4a8d-b21d-46f885d2b8bf.png)

## Writing a React Component

Once we've got our basic `package.json` we can start with `index.jsx`:

```jsx
import React from "react";
import { registerComponent, useStore } from "titan-reactor";

// select frame.time value from the "ui store" 
// the store is aka game data made available to all react plugins
const _timeSelector = store => store.frame.time;

const MyComponent = ({ config }) => {

    // this is computationally efficient in two ways:
    // 1) we are using _timeSelector rather than inlining the function here to reduce object allocation
    // 2) useStore will only cause a re-render if the time has changed
    const time = useStore(_timeSelector);

    return <h1>Hello { config.userName.value }. Game time is {time} </h1>
};

registerComponent({ pluginId: "_plugin_id_", screen: "@replay/ready" }, MyComponent);
```

`registerComponent` lets Titan Reactor know about our new React Component, and will mount it and unmount it according to the screen and layout rules. The `_plugin_id_` macro will be replaced with our actual unique plugin id for us and is just boilerplate.

Additional properties in the first argument allow us to tap into layout and screen rules. In this case **our React component will be mounted when the replay screen is ready (loaded), and unmounted on any other state**.

Your script will be treated by the browser as an ES6 module, meaning you have full access to the module system. Provided for you is an import map for `titan-reactor`, `react`, `react-dom` and `zustand`. You may import these with these names directly. You are free to import additional packages from services such as skypack, however it is recommended that you include files locally eg `import "./my-lib.js"`.

Every component will be provided with their plugin `config` object which corresponds with `config` field of our `package.json`. The component will re-render on any config update.

Note that only mouse clicks events (`onClick`) will be available for listening to any of your react components. This is due to a limitation with having a full screen iframe mostly non-interactable on-top of the game canvas.




## Store Reference

- **frame**
  - **time**: game time label `eg, "12:00"`
  - **frame**: current replay frame
  - **maxFrame**: max replay frame
  - **playerData**: raw player data, use `getPlayerInfo` utility to extract meaningful data
  - **unitProduction**: Int32Array for each player (8 total), with [unitId, count]
  - **upgrades**: Int32Array for each player (8 total), with [upgradeId, level, progress]
  - **research**: Int32Array for each player (8 total), with [researchId, progress]

- **world** : Partial<[WorldStore](https://github.com/imbateam-gg/titan-reactor/blob/dev/src/renderer/stores/realtime/world-store.ts)>
  - **map**: [Map](https://github.com/imbateam-gg/titan-reactor/blob/dev/src/common/types/declarations/bw-chk.d.ts#L21)
  - **replay**: [Replay](https://github.com/imbateam-gg/titan-reactor/blob/dev/src/common/types/declarations/downgrade-replay.d.ts#L15)


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

## native.js

You can create really powerful plugins by using a `native.js` file that is loaded in the same process space as Titan Reactor itself. You can listen to hooks and modify scene and state objects, as well as create custom hooks for other plugins to listen to.

Checkout the official plugins for several examples, and see here for the [list of default hooks](https://github.com/imbateam-gg/titan-reactor/blob/dev/src/renderer/plugins/plugin-system-native.ts#L56).

Simple example listening to arguably the most important hooks:
```js
// your plugin must return an object with keynames matching hook names that you want to listen to
return {
    // config is user config related to your plugin
    // deps is list of dependencies shared from Titan Reactor such as THREE
    // you'll likely want to keep a reference for your own keepsake
    // onInitialized will be called on load if your plugin is already enabled
    // it will also be called anytime the user enables your plugin
    // onInitialized is REQUIRED
    onInitialized(config, deps) {

    },

    // Titan Reactor provides a UI for users to change config of your plugin
    // this hook fires anytime a user has changed a config field
    onConfigChanged(config) {

    },

    // if the user disables your plugin, clean up!
    onDisable() {

    },

    // onGameReady fires when everything is loaded but before the first frame is run
    onGameReady() {
      
    },

    // when the game is over, get rid of any unneeded object references to the previous game!
    onGameDisposed() {

    },
    
}
```

## Communicating between native.js and index.jx

You can send one way messages from native.js to your react components. For a full working example see the official FPS plugin.

In your `index.jsx`:
```jsx
import React from "react";

// useMessage is a hook passed in as a prop for your component
const MyComponent = ({ config, useMessage }) => {

  // any messages sent from native.js are received here
  const message = useMessage();
  return <p>{message.foo}</p>
});

```

In your `native.js`:
```js
let _sendUIMessage;

return {
  onInitialized(config, { sendUIMessage }) {
    // assign it for later use
    _sendUIMessage = sendUIMessage;
  },

  onGameStart() {
    _sendUIMessage({ foo : "bar!" });
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
