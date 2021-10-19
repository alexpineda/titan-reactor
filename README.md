## Titan Reactor 

Titan Reactor is a custom replay viewer for Starcraft and may only be utilized with assets provided by ownership of Starcraft.

- [Join our Discord](http://discord.imbateam.gg/)
- [Demo Video (Youtube)](https://www.youtube.com/watch?v=CwzkjboEbqo)

### Requirements
- A purchased copy of Starcraft
- Microsoft Windows
- Suggested 8GB Ram & VRam

### Development Installation

`yarn install`

for titan reactor

`yarn workspace titan-reactor dev`

you will also need openbw-bridge.exe which is included in static directory for you and can also be built (see https://github.com/imbateam-gg/ChkForge).

or for iscriptah *(iscript animation viewer)*
  
`yarn workspace iscriptah dev`

### Controls
#### Replay Viewer
- Pan - right click drag or arrow keys
- Zoom - middle mouse scroll or Numpad +/-
- Rotate - Numpad / and *
- Arrow keys - Pan camera
- Camera hotkeys - Numpad 0 - 9
- Menu - F10
- Minimap
    * Cut - Left click
    * Pan - Left click hold
    * Slow pan - Shift + Left click hold
- Pause - P
- Full Screen - F11
- E key - Show walkable elevations

#### Map Viewer
- Pan - right click drag or arrow keys
- Zoom - middle mouse scroll or Numpad +/-
- Rotate - middle mouse button
- Rotate - Numpad / and *
- Arrow keys - Pan camera
- Camera hotkeys - Numpad 0 - 9
- E key - Show walkable elevations
- C key - Show/hide mouse cursor

### Contributing
I'm looking for contributors. Please send me a message on discord or feel free to tackle any of the github issues or issues below. PR's welcome.

### Thoughts on current state and TODO

- Replay generation is done via openbw-bridge. Currently this generates broken replays for some 1.16 replays and many SCR replays, this could use a lot of investigating. For SCR we're using a replay file downgrader  where in fact openbw will need to be changed for unit limit to be fully functional. This area could use improvement for reliability and replay support.
- The replay state reader needs to be more robust for errors and correcting itself from potential error states.
- Integration with Shieldbattery will be necessary for live obsing. Since the data source is just a raw binary dump of unit and sprite state (amongst a few other things) I believe this is doable via the same mechanism.
- Multiple observers connecting to the same replay.
- HD Water needs to be implemented in the GLSL shader

  

## LEGAL

Titan Reactor is released to the Public Domain. The documentation and functionality provided by Titan Reactor may only be utilized with assets provided by ownership of Starcraft. If you use the source code you may not charge others for access to it or any derivative work thereof. Starcraft® - Copyright © 1998 Blizzard Entertainment, Inc. All rights reserved. Starcraft and Blizzard Entertainment are trademarks or registered trademarks of Blizzard Entertainment, Inc. in the U.S. and/or other countries. Titan Reactor and any of its maintainers are in no way associated with or endorsed by Blizzard Entertainment®
