# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## Added

-   Additional messaging when updating / installing plugins
-   Type definitons for the UI api
-   customEvents object replacing custom callback methods

## Removed

-   Clear asset cache menu item
-   Plugin callbacks no longer have context value attached

## [v0.6.7]

## Added

-   Macro groups

## Fixed

-   Bunker overlay offset (marine fire)
-   Fix issue where the app would "crash" on loading due to some changes in latest electron api (memory cage in v21)

## Changed

-   Plugin permissions changed from under `config` to `root` of package.json

## [0.6.6]

## Added

-   Exposed default enabled/disabled switch for macros
-   Game & sandbox modes for macro condition testing
-   Hover cursor over units, like in the game
-   Selection circles around 3d models - initial version
-   New apis for macros getHoveredUnits, and getFollowedUnitsPosition
-   Blur transition between render modes

## Changed

-   Improved default macros
-   Unlimited folders for macros

## Fixed

-   Several small optimizations
-   Audio no longer has silences (regression in 0.6.0)
-   Small visual glitch with creep colony construction and other images that shared atlases
-   Big improvement (~5s) on initial loading screen

## [0.6.5]

## Added

-   Macros can execute other macros
-   Active Preview option for modifying macros
-   IScriptah now semi functional again (Tools -> Iscriptah)

## Fixed

-   Several memory leaks due to untested Janitor implementation
-   Squashed some bugs around macros and settings
-   Units are still selectable when the game is paused

## Changed

-   Upgraded to Electron 20, TypeScript 4.8.4, Vite build system and others.
-   Initial macros and plugins setup is automatic and transparent

## [0.6.4]

## Added

-   New post processing and post processing 3d options
-   New minimap & minimap options
-   Macros now show cute little keyboard preview ^^
-   New world event system
-   New macro trigger - mouse click
-   New graphics settings (HD2 options)
-   Cursor is now animated and has cursor size option

## Changed

-   Lots of internal refactoring in preparation for sandbox mode and 3d models
-   Moved camera damping/rotation speed options to global settings
-   Additional error handling
-   Camera starts at a player location
-   Map viewer now uses OpenBW so all images/units/sprites should work
-   Fixed a bug in bw-casclib, allowing mac/linux builds to work now.

## Fixed

-   Default macros automatically install on first run
-   App no longer needs a full reload on initial plugin install
-   Bullet tracking is now more precise

## [0.6.0]

## Added

-   New home screen and map/replay loading screens
-   Macro hotkey system with "programmable" triggers and action sequences
-   New global options: minimap size, asset preload, default scene controller, anisotropy
-   Terrain now has mirrored edge tiles
-   Plugins API v2

## Changed

-   Global Settings is no longer a plugin and now built into the app
-   Menus have been re-arranged. Plugin Settings is now called Command Center.
-   More optimizations to reduce GC usage, caused minor bugs in audio which will be addressed
-   HD is now the default (rather than HD2)
-   Flying units are further affected by terrain height
-   Deprecated plugins will not show in online tab
-   Shadows will be placed in default locations unless in "3d" mode

### Fixed

-   Regression in floating sprites is fixed
-   Regression creep edges fixed
-   Sprite overlay edges bug fixed
-   Bullet tracking now works on floating buildings
-   Regression on HP bar on resources now fixed
-   Follow unit now unfollows on minimap click
-   Previously on 0.5.3 release:
    -   Tank mode siege tank turrets will now look better when camera rotated
    -   When the camera target is above the horizon units will not rotate oddly
    -   Disposing of the previous replay should execute before any additional plugin calls
    -   UMS games that use set alliance now work (thank you Heinerman!)
    -   Maps that use disabled doodads now work (thank you Heinerman!)
    -   Observer chat won't break replays anymore

### Removed

-   HD2 is no longer an option
-   Plugin API:
    -   Deprecated getFPS.
    -   Deprecated maxFrame and time fields from the useFrame() hook, use useReplay() and getFriendlyTime() instead
-   Keyboard shortcuts are no longer part of plugins and are now configured with the hotkey macro system.

## [0.5.3]

### Added

-   Warp flash animation on protoss buildings
-   skipForward, skipBackward, speedUp, speedDown, togglePause plugin apis now return appropriate values
-   speed changes now goes by 0.25 increments when >= 1 and <= 2

### Changed

-   Hotkeys activate on key up event only
-   New home page with links and videos
-   Many small optimizations across the board
-   Defaults to fullscreen

### Fixed

-   Tank mode siege tank turrets will now look better when camera rotated
-   When the camera target is above the horizon units will not rotate oddly
-   Disposing of the previous replay should execute before any additional plugin calls
-   UMS games that use set alliance now work (thank you Heinerman!)
-   Maps that use disabled doodads now work (thank you Heinerman!)
-   Observer chat won't break replays anymore

### Removed

-   Map camera boundaries for the time being as it's causing some unwanted errors / side effects

## [0.5.2] - 2022-07-3

### Added

-   Added completed upgrade and tech hooks for native plugins

### Fixed

-   Units don't stay selected after being killed
-   Unit discoloration bug is fixed
-   Energy max is properly shown on energy bar depending on upgrade completed
-   Fix Y height bug where units would randomly be elevated

### Changed

-   Geometry will be optimized in debug mode now as well

## [0.5.1] - 2022-07-1

### Changed

-   Allow Backspace key to delete plugin hotkey setting

### Fixed

-   Rolling numbers now respect up and down time
-   Bullet trails now properly follow bullets in the Y coordinate

## [0.5.0] - 2022-06-24

### Added

-   All new and extensive plugin system:
    -   Create custom HUD and UI elements using live data from the game and game files.
    -   [Modify the existing plugins or create your own!](https://github.com/imbateam-gg/titan-reactor/blob/dev/CREATING_PLUGINS.md)
-   Bullet Y Tracking. Watch as flying units and ground units exchange fire from their different elevations!
-   Picture In Picture mode allowing more action to be captured by a single observer
-   Follow unit command (Key F)
-   New menus and debug menus

### Changed

-   Scanner no longer shows in minimap
-   Massive performance improvements reducing GC usage
-   Scrubbing through a replay won't flash the images any more
-   The camera shaking logic has drastically improved

## [0.4.0] - 2022-02-8

### Added

-   Battle Cam / Helicopter Mode (Default Key "F3")
    -   Hover around battles like a helicopter
    -   Recommendation: Use in moderate amounts for high intensity engagements.
    -   Use arrow keys to move forward / left right
    -   Use the mouse to adjust pitch/yaw/roll
    -   Use mousewheel to go higher or lower in elevation
    -   Use left and right mouse click for instant zoom in / out
-   Overview Cam (Default Key "F5") WIP
    -   Allows quick overview of entire battle field
-   Default Cam Hotkey "F2 or Escape"
-   Optional Display FPS option

### Changed

-   Speed up FPS via several optimizations

### Fixed

-   Random creep holes in SD terrain

### Removed

-   Palette rotation in SD

## [0.3.0] - 2022-01-26

### Changed

-   Support for all SCR replays.
-   Free moving camera.
-   Integrated OpenBW = a more responsive experience.
-   Configurable keyboard shortcuts
    -   Seek Backwards (Default `[`)
    -   Seek Forwards (Default `]`)
    -   Speed Up (Default `U`)
    -   Speed Down (Default `D`)
    -   Pause / Unpause (Default `P`)
    -   (Smooth) Zoom In (Default `Numpad +`)
    -   (Smooth) Zoom Out (Default `Numpad -`)
    -   These are all configurable in your user `settings.yml` file.
-   Sprites rotate with camera.
-   Anisotropy and pixel ratio graphics settings.
-   Changed settings to use YAML file for easier hand editing.
-   Load all assets up front to reduce any stuttering during game.
-   Improved logging.
-   Allow SCR directory to be either your install directory OR the extracted files from a Casc Storage.
-   Improved lighting.
-   Improved state cleanup, loading multiple different maps/replays should cleanly work.

### Removed

-   Stripped out HUD and Options UI (so I can focus on core)
-   Good support for HD2/HD terrain, sluggish first render time, on the todo list.
-   Unit selection / unit boxing for the time being.

[unreleased]: https://github.com/imbateam-gg/titan-reactor/compare/v0.6.7...HEAD
[0.6.7]: https://github.com/imbateam-gg/titan-reactor/compare/v0.6.6...v0.6.7
[0.6.6]: https://github.com/imbateam-gg/titan-reactor/compare/v0.6.5...v0.6.6
[0.6.5]: https://github.com/imbateam-gg/titan-reactor/compare/v0.6.4...v0.6.5
[0.6.4]: https://github.com/imbateam-gg/titan-reactor/compare/v0.6.0...v0.6.4
[0.6.0]: https://github.com/imbateam-gg/titan-reactor/compare/v0.5.3...v0.6.0
[0.5.3]: https://github.com/imbateam-gg/titan-reactor/compare/v0.5.2...v0.5.3
[0.5.2]: https://github.com/imbateam-gg/titan-reactor/compare/v0.5.1...v0.5.2
[0.5.1]: https://github.com/imbateam-gg/titan-reactor/compare/v0.5.0...v0.5.1
[0.5.0]: https://github.com/imbateam-gg/titan-reactor/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/imbateam-gg/titan-reactor/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/imbateam-gg/titan-reactor/compare/alpha-0.1.3...v0.3.0
