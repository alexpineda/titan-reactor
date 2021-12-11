# sidegrade-replay

"Sidegrades" Starcraft Remastered replays to 1.16

 This utility converts all formats to 1.16, including compression of blocks using implode. However, it migrates all unit tags to SCR format. Why? Because everything is mostly setup here and all I had to do was change openbw to support 3400 units and not 1.16 unit counts + zlib compression  and I'm not good at c++, so this is a side grade :D
 

In summary:
 * Converts replay magic header to TitanReactor (0x53526574) specific one since we are fiddling with the format
 * Compresses all blocks with implode
 * Converts SCR replay commands to 1.16 replay commands yet preserving the scr unit tags
 * Converts 1.16 replay command unit tags to SCR unit tags
 * Converts SCR CHK sections to 1.16 CHK sections


### Exposed functions
- `parseReplay` parses both SCR and 1.16 replays
- `CommandsStream` allows streamed command parsing, useful for AI Bots where hundres of commands per frame are comon.
- `sidegradeReplay` sidegrades 1.16 and SCR replays
- `Version` an enum. 0 = broodwar. 1 = remastered. 2 = titanReactor.

It also includes utilities for mapping 1.22+ map tiles to 1.16 tiles, however note that the mapping is never particularly good enough and will cause gameplay issues. This package is meant to be used with a version of openbw supporting vx4ex and 3400 units, and a BrooDat.mpq with the scr tiles included.

This package is a part of the [Titan](https://github.com/imbateam-gg/titan-reactor) Reactor project.