## Titan Reactor 

Titan Reactor is a fan made map and replay viewer specifically made for content creators of the best game in the world, Starcraft Remastered.

![image](https://user-images.githubusercontent.com/586716/139562963-493ffd7d-e21a-46e8-a9f6-29b2761ab852.png)


- [Join our Discord](http://discord.imbateam.gg/)
- [Demo Video (Youtube)](https://www.youtube.com/watch?v=CwzkjboEbqo)
- [Development Resources](https://github.com/imbateam-gg/awesome-bw-dev)

### Requirements
- A purchased copy of Starcraft Remastered
- Microsoft Windows
- Suggested 8GB Ram & VRam

### Development Installation

`yarn install`

and then

`yarn workspace titan-reactor dev`


### Contributing

See our [Contributing Guide](https://github.com/imbateam-gg/titan-reactor/blob/dev/CONTRIBUTING.md).

### Mouse and Keyboard Controls
See our [Mouse controls and Keyboard shortcut documentation](https://github.com/imbateam-gg/titan-reactor/blob/dev/CONTROLS.md).

### Thoughts on current state and TODO

- Replay generation is done via openbw-bridge. Currently this generates broken replays for some 1.16 replays and many SCR replays, this could use a lot of investigating. For SCR we're using a replay file downgrader  where in fact openbw will need to be changed for unit limit to be fully functional. This area could use improvement for reliability and replay support.
- The replay state reader needs to be more robust for errors and correcting itself from potential error states.
- Integration with Shieldbattery will be necessary for live obsing. Since the data source is just a raw binary dump of unit and sprite state (amongst a few other things) I believe this is doable via the same mechanism.
- Multiple observers connecting to the same game.
- HD Water needs to be implemented in the GLSL shader.

## LEGAL

Titan Reactor is released to the Public Domain. The documentation and functionality provided by Titan Reactor may only be utilized with assets provided by ownership of Starcraft. If you use the source code you may not charge others for access to it or any derivative work thereof. Starcraft® - Copyright © 1998 Blizzard Entertainment, Inc. All rights reserved. Starcraft and Blizzard Entertainment are trademarks or registered trademarks of Blizzard Entertainment, Inc. in the U.S. and/or other countries. Titan Reactor and any of its maintainers are in no way associated with or endorsed by Blizzard Entertainment®
