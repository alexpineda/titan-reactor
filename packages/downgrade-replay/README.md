# downgrade-replay

Downgrade Starcraft Remastered replays to 1.16

### Exposed functions
- `parseReplay` parses both SCR and 1.16 replays
- `CommandsStream` allows streamed command parsing, useful for AI Bots where hundres of commands per frame are comon.
- `downgradeReplay` downgrades (to varying degrees of success) from SCR to 1.16 replay formats
- `validateDowngrade` validates if a downgrade will be successful. Currently just validates that unit tags wont exceed 1700.
- `Version` an enum. 0 = broodwar. 1 = remastered.

It also includes utilities for mapping 1.22+ map tiles to 1.16 tiles.

This package is a part of the [Titan](https://github.com/imbateam-gg/titan-reactor) Reactor project.