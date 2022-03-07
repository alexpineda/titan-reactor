# Table of Contents
- [Table of Contents](#table-of-contents)
  - [Overview](#overview)
  - [Plugin Examples](#plugin-examples)
  - [How it works](#how-it-works)
  - [Writing a React Component](#writing-a-react-component)
  - [useStore hook](#usestore-hook)
  - [Store Reference](#store-reference)
  - [Plugin.html Reference](#pluginhtml-reference)
  - [native.js](#nativejs)
  - [CSS Variables](#css-variables)
  - [CSS Fonts](#css-fonts)
  - [Advanced Examples](#advanced-examples)
  - [Debugging](#debugging)
  - [Request For Plugin](#request-for-plugin)


## Overview

Plugins in Titan Reactor allow you to create custom menus, score cards and many other things of your imagination. Hooks directly into the game state allow flexible, real time displays, to suit many different needs. 

- A plugin can be visual (React/JSX based), a task (like uploading a replay), or both. 
- A plugin can have custom user configuration, for which Titan Reactor automatically provides a configuration UI.
- Allows the community to provide more integrated experiences

## Plugin Examples

Titan Reactor comes with [official plugins under `bundled/plugins`](https://github.com/imbateam-gg/titan-reactor/tree/dev/packages/titan-reactor/bundled/plugins) so poke around and get an idea of how they work. **For a plugin to be enabled the user must also have the plugin id in their global settings.json in the `plugins.enabled` array.**

Minimal plugin:

```html
<plugin id="unique.id" name="My Plugin" version="0.1">
    <channel>
        <script type="module">
            console.log("hello world");
        </script>
    </channel>
</plugin>
```

You can have as many channels as you like. This channel is considered a "plugin channel", ie one method of utilizing/consuming your plugin. It'll be activated as soon as Titan Reactor starts.




## How it works

Your plugin directory will be scanned for `plugin.html`, `userConfig.json` and `native.js` files. Out of these three files, `plugin.html` is the only file that must be present. 

`native.js` provides plugin developers higher privileges at the cost of user security, but allows you to access full Titan Reactor game state, where as `plugin.html` React based plugins only get a partial copy of the game state in an isolated iframe.

`userConfig.json` is specifically for users to modify in order to customize settings for your plugin. The values follow the [Leva convention](https://github.com/pmndrs/leva/blob/main/docs/inputs.md), you can see also their [storybook examples](https://leva.pmnd.rs/?path=/story/inputs-string--simple). We use Leva internally to allow users to customize their userSettings. At a minimum each value must be a wrapper around a `value` property:
```json
{
    customProp: {
        value: "user config value here!"
    }
}
```

Your `<script></script>` html and any `.jsx` file under your plugin directory will get transpiled by Titan Reactor. Special macro strings `_plugin_path_` and `_channel_id_` will get replaced with the relative path to your plugin (eg. "my-plugin") and your channel id respectively.

## Writing a React Component

This section provides additonal information on writing a React component for the Titan Reactor ecosystem. **This section does not cover React basics, for that please seek alternative learning resources!**

So we've written our basic `plugin.html` and we're ready to develop a visual plugin channel.

```html
<plugin id="unique.id" name="My Plugin" version="0.1">
    <channel screen="@home/ready">
        <script async type="module">
            // ... let's write code here ...
        </script>
    </channel>
</plugin>
```

Here we've added the screen option to our channel. Every screen has both "loading" and "ready" states. In this case **our React component which we will develop will be mounted when the home screen is ready (loaded), and unmounted on any other state**.

Your script will be treated by the browser as an ES6 module, meaning you have full access to the module system. Provided for you is an import map for `titan-reactor`, `react`, `react-dom` and `zustand`. You may import these with these names directly. You are free to import additional packages from services such as skypack, however it is recommended that you include files locally eg `import "./my-lib.js"`.

Now we can start writing our React Component:
```jsx
import React from "react";
import { registerComponent } from "titan-reactor";

registerComponent("_channel_id_", ({ userConfig }) => {
    return <h1>Hello { userConfig.name.value }</h1>
})
```

`registerComponent` lets Titan Reactor know about our new React Component, and will mount it and unmount it according to the screen rules. Remember that the `_channel_id_` macro will be replaced with our appropriate channel identifier for us. 

Every component will be provided with their plugin `userConfig` object which corresponds with `userConfig.json` for read only access. The component will re-render if the userConfig gets updated.

## useStore hook

The plugin runtime provides a useStore hook for channels to access game state. This is a zustand store, [please see zustand for complete details](https://github.com/pmndrs/zustand). This brief section will illustrate two uses:

**Regular Use**
```jsx
    import { useStore } from "titan-reactor";

    ...

    // outside our component
    const selector = store => store.world.replay.players;

    // inside our component, useStore(selector)
    const players = useStore(selector);
```

It's best to [keep the "selector" function memoized](https://github.com/pmndrs/zustand#memoizing-selectors) with useCallback or kept outside the function to minimize object allocation. If a selector isn't provided your component will re-render every game second since that is when `store.frame` gets updated which is the most frequently updated.

**Optimized (Transient) Use**

This method is a small optimization minimizing virtual dom diffing and re-renders. See [FPS Meter plugin](https://github.com/imbateam-gg/titan-reactor/tree/dev/packages/titan-reactor/bundled/plugins/fps) and [Zustand documentation](https://github.com/pmndrs/zustand#transient-updates-for-often-occuring-state-changes).


## Store Reference

- **frame**
  - **fps**: frames per second
  - **time**: game time label `eg, "12:00"`
  - **frame**: current replay frame
  - **maxFrame**: max replay frame

- **world** : Partial<[WorldStore](https://github.com/imbateam-gg/titan-reactor/blob/dev/packages/titan-reactor/src/renderer/stores/realtime/world-store.ts#L6)>
  - **map**: [Map](https://github.com/imbateam-gg/titan-reactor/blob/dev/packages/titan-reactor/src/common/types/declarations/bw-chk.d.ts#L21)
  - **replay**: [Replay](https://github.com/imbateam-gg/titan-reactor/blob/dev/packages/titan-reactor/src/common/types/declarations/downgrade-replay.d.ts#L2)


- **scene** : Partial<[ScreenStore](https://github.com/imbateam-gg/titan-reactor/blob/dev/packages/titan-reactor/src/renderer/stores/screen-store.ts#L8)>
  - **type**: [ScreenType](https://github.com/imbateam-gg/titan-reactor/blob/dev/packages/titan-reactor/src/common/types/screen.ts#L1)
  - **status**: [ScreenStatus](https://github.com/imbateam-gg/titan-reactor/blob/dev/packages/titan-reactor/src/common/types/screen.ts#L1)
  - **error**: An object if there is an application critical error

- **dimensions** [GameCanvasDimensions](https://github.com/imbateam-gg/titan-reactor/blob/dev/packages/titan-reactor/src/common/types/image.ts#L11)

## Plugin.html Reference
```html
<plugin id="unique.id" version="0.1" name="Plugins Name" author="optional Author" details="optional details" package-url="optional repository url">
```
- id: *required* unique identifier for your plugin, eg. `author-name.plugin-name`
- version: *required* in order to determine version and update availability
- name: *required* user friendly name for your plugin
- author: *optional* author name
- description: *optional* further description of your plugin
- package-url: *optional* github repository url or npm package url for detecting updates

```html
<channel>
<channel screen="screenType/screenStatus">
<channel snap="location">
```
screen
- screenType = `@home` | `@replay` | `@map`

- screenStatus = `loading` | `ready`

`@home/loading` is not available to plugins. if `screen` is omitted, the plugin channel will be mounted `@home/ready` and remain mounted.


snap
- `top` | `left` | `right` | `bottom` | `center`

If multiple channels are snapped into the same location, we use `userConfig.order.value` to determine an ordering. 

If snap is omitted, positioning is upto the plugin author and the root node must have style `position: absolute`.

A channel can have atmost one script element. `async` and `type` attributes will be added for you in practice and so are optional to include in the template. Currently the `src` attribute is not supported, but you may use the `import` statement along with plugin macros to include an external jsx file rather than inline it.

```html
<!-- inline example -->
<script async type="module">
    /// ...channel implementation
</script>

<!-- external example my-plugin.jsx -->
<script async type="module">
  import "./_plugin_path_/my-plugin.jsx?channel-id=_channel_id_";

</script>
```

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

## CSS Fonts

Additional font-families available to your styles:

`Inter` the default body font.

`Conthrax` and `Conthrax-Bold` are good for scores and numbers.

## Advanced Examples

A channel script doesn't necessarily need a visual React component, it could simply read replay data and relay it to a server for archiving for example. Additionally a plugin doesn't necessarily even need a `script` element if using `native.js` for more control. If using `native.js` you can still communicate with your channels if you require the visual element as well.

## Debugging

TODO.

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