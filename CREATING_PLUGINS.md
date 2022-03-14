# Table of Contents
- [Table of Contents](#table-of-contents)
  - [Overview](#overview)
  - [Your first plugin package.json](#your-first-plugin-packagejson)
  - [How it works](#how-it-works)
  - [Writing a React Component](#writing-a-react-component)
  - [useStore hook](#usestore-hook)
  - [Store Reference](#store-reference)
  - [registerComponent reference](#registercomponent-reference)
  - [native.js](#nativejs)
  - [CSS Variables](#css-variables)
  - [CSS Fonts](#css-fonts)
  - [Supported package.json fields](#supported-packagejson-fields)
  - [Publishing Your Plugin](#publishing-your-plugin)
  - [Request For Plugin](#request-for-plugin)


## Overview

Plugins in Titan Reactor allow you to create custom menus, score cards and many other things of your imagination. Hooks directly into the game state allow flexible, real time displays, to suit many different needs. 

- A plugin can be visual (React/JSX based), a task (like uploading a replay), or both. 
- A plugin can have custom user configuration, for which Titan Reactor automatically provides a configuration UI.
- Allows the community to provide more integrated experiences

## Your first plugin package.json


*plugins/my-cool-plugin/package.json*
```json
{
  "name": "@titan-reactor-plugin/my-cool-plugin",
  "version": "v1",
  "keywords": ["titan-reactor-plugin"]
}
```

You'll first need a `package.json` under your plugin folder with at least a unique name and version. We use the [npm package.json spec](https://docs.npmjs.com/cli/v8/configuring-npm/package-json) for our conventions here. For your version number it is recommended to use semver `1.0.0`, `2.0.0` etc for updates. 

As for displaying things to the user, we'll later use an `index.jsx` file.

## How it works

Your plugin directory will be scanned for `package.json`, `index.jsx` and `native.js` files. All are optional, but without `package.json` the others will not be loaded.

`index.jsx` allows you to easily access game state along with your React components. Your code and component will live in a shared iframe environment with other plugins in a separate process. This will mostly be used for displaying things to the user, either loading screens or HUD type elements.

`native.js` provides plugin developers higher privileges at the cost of user security, but allows you to access full Titan Reactor game state on the main Chromium process. This will mostly be used for modifying game state, such as player colors.

We use the `config` value in `package.json` specifically for users to modify in order to customize settings for your plugin. The values follow the [Leva convention](https://github.com/pmndrs/leva/blob/main/docs/inputs.md), you can see also their [storybook examples](https://leva.pmnd.rs/?path=/story/inputs-string--simple). We use Leva internally to allow users to customize their userSettings. At a minimum each value must be a wrapper around a `value` property:
```json
{
    ...other plugin fields ...
    "config": {
      "usersFavoriteColor": {
          "value": "this value can be changed by the user since I have a value field!"
      },
      "privateProp": "this prop is for plugin author since it's not an object and/or doesn't have a value field"
    }
}
```

Your `.jsx` files under your plugin directory will get transpiled by Titan Reactor. Special macro string `_plugin_id_` will get replaced with a uniquely generated plugin id.

## Writing a React Component

This section provides additonal information on writing a React component for the Titan Reactor ecosystem. **This section does not cover React basics, for that please seek alternative learning resources!**

Once we've got our basic `package.json` we can start with `index.jsx`:

```jsx
import React from "react";
import { registerComponent, assets, util  } from "titan-reactor";

registerComponent({ pluginId: "_plugin_id_", screen: "@home/ready" } , ({ config }) => {
    return <h1>Hello { config.name.value }</h1>
})
```

There is a good amount going on here. We're importing React in order to render out JSX and we're importing `registerComponent` from titan-reactor in order to get our component managed by the plugin system.

`registerComponent` lets Titan Reactor know about our new React Component, and will mount it and unmount it according to the screen and layout rules. Remember that the `_plugin_id_` macro will be replaced with our actual unique plugin id for us. 

Additional properties in the first argument allow us to tap into layout and screen rules. In this case **our React component will be mounted when the home screen is ready (loaded), and unmounted on any other state**.

Your script will be treated by the browser as an ES6 module, meaning you have full access to the module system. Provided for you is an import map for `titan-reactor`, `react`, `react-dom` and `zustand`. You may import these with these names directly. You are free to import additional packages from services such as skypack, however it is recommended that you include files locally eg `import "./my-lib.js"`.

Every component will be provided with their plugin `config` object which corresponds with `config` field of our `package.json`. The component will re-render on any config update. `titan-reactor` also exports `getPlayerInfo`  which is useful for simplifying access to certain values (see player-bar), and `assets` which provides several in game graphics for you to use such as icons.

## useStore hook

Titan Reactor provides a useStore hook for channels to access game state. This is a zustand store, [please see zustand for complete details](https://github.com/pmndrs/zustand). This brief section will illustrate two uses:

**Regular Use**
```jsx
    import { useStore } from "titan-reactor";

    ...

    // outside our component
    const selector = store => store.world.replay.header.players;

    // inside our component, useStore(selector)
    const players = useStore(selector);
```

It's best to [keep the "selector" function memoized](https://github.com/pmndrs/zustand#memoizing-selectors) with useCallback or kept outside the function to minimize object allocation. If a selector isn't provided your component will re-render every game second since that is when `store.frame` gets updated which is the most frequently updated.

**Optimized (Transient) Use**

This method is a small optimization minimizing virtual dom diffing and re-renders. See [FPS Meter plugin](https://github.com/imbateam-gg/titan-reactor-community/tree/main/plugins/fps) and [Zustand documentation](https://github.com/pmndrs/zustand#transient-updates-for-often-occuring-state-changes).


## Store Reference

- **frame**
  - **fps**: frames per second
  - **time**: game time label `eg, "12:00"`
  - **frame**: current replay frame
  - **maxFrame**: max replay frame
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

## native.js

Native.js lives at the application level and so has access to the real javascript objects of Titan Reactor. Below are the hooks available to native.js

```js
return {
    onInitialized(config) {
      super.onInitialized(config);

    },

    onScreenChange(type, status) {

    },

    onFrame(gameStatePosition) {

    }
}
```

## CSS Variables

The following css variables are available to your styles:
- --game-width
- --game-height
- --minimap-width
- --minimap-height

Included in the "runtime" environment is also the full set of open prop variables for use in your CSS. [See Open Props for more details.](https://open-props.style/)

## CSS Fonts

Additional font-families available to your styles:

`Inter` the default body font.

`Conthrax` and `Conthrax-Bold` are good for scores and numbers.

## Supported package.json fields

`name` - your plugin name, must be globally unique.

`version` - your plugin version, using semver.

`keywords` - an array which **must** include "titan-reactor-plugin".

`author` - your name (string format only)

`description` - a further description of your plugin

`config` - user editable config object

`repository` - npm or github repository url or object to determine whether new versions are available

## Publishing Your Plugin

In order to make your plugin available to others, simply publish your package to `npm` and ensure you have `titan-reactor-plugin` in keywords. If you'd like to publish under the **@titan-reactor-plugins** scope please see the [Titan Reactor Community](https://github.com/imbateam-gg/titan-reactor-community) repository.
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