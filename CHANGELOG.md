# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Warp flash animation on protoss buildings
- skipForward, skipBackward, speedUp, speedDown, togglePause plugin apis now return appropriate values


### Changed
- Hotkeys activate on key up event only

### Fixed
- Tank mode siege tank turrets (phew!) will now look better when camera rotated
- When the camera target is above the horizon units will not rotate oddly
- Disposing of the previous replay should execute before any additional plugin calls


## [0.5.2] - 2022-07-3

### Added
- Added completed upgrade and tech hooks for native plugins

### Fixed
- Units don't stay selected after being killed
- Unit discoloration bug is fixed
- Energy max is properly shown on energy bar depending on upgrade completed
- Fix Y height bug where units would randomly be elevated

### Changed
- Geometry will be optimized in debug mode now as well

## [0.5.1] - 2022-07-1

### Changed
- Allow Backspace key to delete plugin hotkey setting

### Fixed
- Rolling numbers now respect up and down time
- Bullet trails now properly follow bullets in the Y coordinate

## [0.5.0] - 2022-06-24
### Added 
  - All new and extensive plugin system:
    - Create custom HUD and UI elements using live data from the game and game files.
    - [Modify the existing plugins or create your own!](https://github.com/imbateam-gg/titan-reactor/blob/dev/CREATING_PLUGINS.md)
  - Bullet Y Tracking. Watch as flying units and ground units exchange fire from their different elevations!
  - Picture In Picture mode allowing more action to be captured by a single observer
  - Follow unit command (Key F)
  - New menus and debug menus
  
### Changed
- Scanner no longer shows in minimap
- Massive performance improvements reducing GC usage
- Scrubbing through a replay won't flash the images any more
- The camera shaking logic has drastically improved


## [0.4.0] - 2022-02-8
### Added 
- Battle Cam / Helicopter Mode (Default Key "F3")
  - Hover around battles like a helicopter
  - Recommendation: Use in moderate amounts for high intensity engagements.
  - Use arrow keys to move forward / left right
  - Use the mouse to adjust pitch/yaw/roll
  - Use mousewheel to go higher or lower in elevation
  - Use left and right mouse click for instant zoom in / out
- Overview Cam (Default Key "F5") WIP
  - Allows quick overview of entire battle field
- Default Cam Hotkey "F2 or Escape"
- Optional Display FPS option

### Changed
- Speed up FPS via several optimizations

### Fixed
- Random creep holes in SD terrain
### Removed
- Palette rotation in SD

## [0.3.0] - 2022-01-26

### Changed
- Support for all SCR replays.
- Free moving camera.
- Integrated OpenBW = a more responsive experience.
- Configurable keyboard shortcuts
  - Seek Backwards (Default `[`)
  - Seek Forwards (Default `]`)
  - Speed Up (Default `U`)
  - Speed Down (Default `D`)
  - Pause / Unpause (Default `P`)
  - (Smooth) Zoom In (Default `Numpad +`)
  - (Smooth) Zoom Out (Default `Numpad -`)
  - These are all configurable in your user `settings.yml` file.
- Sprites rotate with camera.
- Anisotropy and pixel ratio graphics settings.
- Changed settings to use YAML file for easier hand editing.
- Load all assets up front to reduce any stuttering during game.
- Improved logging.
- Allow SCR directory to be either your install directory OR the extracted files from a Casc Storage.
- Improved lighting.
- Improved state cleanup, loading multiple different maps/replays should cleanly work.

### Removed
- Stripped out HUD and Options UI (so I can focus on core)
- Good support for HD2/HD terrain, sluggish first render time, on the todo list.
- Unit selection / unit boxing for the time being.


[Unreleased]: https://github.com/imbateam-gg/titan-reactor/compare/v0.5.2...HEAD
[0.5.2]: https://github.com/imbateam-gg/titan-reactor/compare/v0.5.1...v0.5.2
[0.5.1]: https://github.com/imbateam-gg/titan-reactor/compare/v0.5.0...v0.5.1
[0.5.0]: https://github.com/imbateam-gg/titan-reactor/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/imbateam-gg/titan-reactor/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/imbateam-gg/titan-reactor/compare/alpha-0.1.3...v0.3.0
[0.2.0]: https://github.com/imbateam-gg/titan-reactor/compare/alpha-0.1.2...alpha-0.1.3