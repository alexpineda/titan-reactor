# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).


## [UNRELEASED] - 2022-01-19
### Added
- Support for majority (if not all) SCR replays! Please send any that may not work for you.
- Added new replay seeking keyboard shortcuts.
  - Seek Backwards (Default `[`)
  - Seek Forwards (Default `]`)
  - Speed Up (Default `U`)
  - Speed Down (Default `D`)
  - Pause / Unpause (Default `P`)
  - These are all configurable in your user `settings.yml` file.

### Changed
- Embedded OpenBW into the application via WASM. An external application is no longer required.
- Changed settings to use YAML file for easier hand editing.
- Allow free movement of the camera (for now)
- Support for lots of commands in replays, typically generated in AI games.
- Load all assets up front to reduce any stuttering during game.
- Improved logging.
- Allow SCR directory to be either your install directory OR the extracted files from a Casc Storage.

### Removed
- Stripped out HUD and Options UI (until new plugin system is available)


[Unreleased]: https://github.com/imbateam-gg/titan-reactor/compare/alpha-0.1.3...HEAD
[0.2.0]: https://github.com/imbateam-gg/titan-reactor/compare/alpha-0.1.2...alpha-0.1.3