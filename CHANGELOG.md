# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).


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


[Unreleased]: https://github.com/imbateam-gg/titan-reactor/compare/v0.3.0...HEAD
[0.3.0]: https://github.com/imbateam-gg/titan-reactor/compare/alpha-0.1.3...v0.3.0
[0.2.0]: https://github.com/imbateam-gg/titan-reactor/compare/alpha-0.1.2...alpha-0.1.3