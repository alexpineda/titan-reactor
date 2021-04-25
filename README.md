## Titan Reactor 

Titan Reactor is a custom replay viewer for Starcraft and may only be utilized with assets provided by ownership of Starcraft. This is INCOMPLETE software and may not work as expected. This has been a hobby project and so improvements should continue to be slow and steady as it gets refined into a great viewer for all of us.

[Join our Discord](http://discord.imbateam.gg/)

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
- Camera hotkeys - Numpad 0 - 9
- Menu - F10
- Minimap
    * Cut - Left click
    * Pan - Left click hold
    * Slow pan - Shift + Left click hold
- Pause - P
- Full Screen - F11

#### Map Viewer
- Pan - right click drag or arrow keys
- Zoom - middle mouse scroll or Numpad +/-
- Rotate - middle mouse button
- Camera hotkeys - Numpad 0 - 9

### Contributing
I'm looking for contributors. Please send me a message on discord or feel free to tackle any of the github issues or issues below. It's not cleanest code base by far so if you have any questions just message. PR's welcome.

### Thoughts on current state and TODO

- Replay generation is done via openbw-bridge. Currently this generates broken replays for some 1.16 replays and many SCR replays, this could use a lot of investigating. For SCR we're using a replay file downgrader  where in fact openbw will need to be changed for unit limit to be fully functional. This area could use improvement for reliability and replay support.
- The replay state reader needs to be more robust for errors and correcting itself from potential error states.
- With the recent work done on production tabs we introduced a Major GC issue somewhere, and so evaluating and optimizing object creation has been and will continue to be a priority to ensure we don't trigger Major GC.
- We'd like to eventually integrate with Shieldbattery for live obsing. Since the data source is just a raw binary dump of unit and sprite state (amongst a few other things) I believe this is doable via the same mechanism. Needs further investigation.
- Proper clean up. Ensuring all resources are cleaned up and we don't create any memory leaks in between repeat replay and map viewing
- Multiple observers connecting to the same replay.
- Final touches for HD, protoss building warp in, water effects. Some overlays show surrounding artifacts (command center blink, bunker)
- Improving how rendering is done for regular HD sprites since currently there is no depth testing in order to draw in the same order as BW.
- Optimizing GLTF loading for battle cam transition.
- Improvements on terrain and general aesthetics always welcome.
- Bundling, auto-update, etc.
- Camera improvements, etc. etc.. Check the roadmap for more.

  [Further Roadmap](https://trello.com/b/ieI76i1Z/titan-reactor-roadmap)
  

## LEGAL

Titan Reactor is released to the Public Domain. The documentation and functionality provided by Titan Reactor may only be utilized with assets provided by ownership of Starcraft. If you use the source code you may not charge others for access to it or any derivative work thereof. Starcraft® - Copyright © 1998 Blizzard Entertainment, Inc. All rights reserved. Starcraft and Blizzard Entertainment are trademarks or registered trademarks of Blizzard Entertainment, Inc. in the U.S. and/or other countries. Titan Reactor and any of its maintainers are in no way associated with or endorsed by Blizzard Entertainment®