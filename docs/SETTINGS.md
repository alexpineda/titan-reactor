# App Settings & Configuration

![command_1](https://github.com/imbateam-gg/titan-reactor/assets/586716/9709ff59-8943-402f-a5a5-f57d64a5ed81)


## Directory Paths
- **StarCraft**:                Path to the StarCraft install directory or the extracted StarCraft CASC files directory.
- **Maps**:                     The default directory for maps.
- **Replays**:                  The default directory for replays.
- **Assets**:                   Directory for 3d models.
- **Plugins**:                  Path to directory containing third-party plugins.


## Audio Settings
- **Global Volume**: Adjusts overall volume, range from 0 to 1.
- **Music Volume**: Sets music volume, range from 0 to 1.
- **Sound Effects**: Controls sound effect volume, range from 0 to 1.
- **Play Intro Sounds**: Toggles introductory sounds (wraiths).

## Graphics Settings
- **Pixel Ratio**: Sets the resolution scale, ranges from 0.5 to max setting. Set this to max for best quality.
- **Use HD2**: Controls usage of half resolution textures, options include "As Mipmap", "Never. Only HD.", and "Exclusively".
- **Preload Assets**:  Preloads graphical assets for smoother in game loading.
- **Cursor Size**: Sets cursor size, range from 0.5 to 4.

## Minimap Settings
- **Enabled**: Controls minimap visibility.
- **Interactive**: Enables interactive features on the minimap.
- **Soft Edges**: Applies soft edges to the minimap.
- **Scale**: Sets the size of the minimap, ranges from 1 to 10.
- **Position**: Sets minimap position, supports small steps.
- **Rotation**: Controls minimap rotation, supports small steps.
- **Opacity**: Sets minimap opacity, ranges from 0 to 1.

## Input Settings
- **Scene Controller**: Sets default scene controller from available plugins. ie The plugin that controls the view and view inputs.
- **Damping Factor**: Controls camera movement fluidity, range from 0.01 to 0.1.
- **Movement Speed**: Sets camera speed.
- **Rotate Speed**: Controls camera rotation speed.
- **Camera Shake Strength**: Sets camera shake intensity, range from 0 to 1.
- **Zoom Levels**: Specifies zoom levels for the camera.
- **Unit Selection**: Enables unit selection, hidden by default. Used by plugins.
- **Cursor Visible**: Toggles cursor visibility, hidden by default. Used by plugins.

## Utilities
- **Debug Mode**: Enables debug features.
- **Sanity Check Replay Commands**: Checks and rewrites command buffer overflows.
- **Detect Melee Observers**: Automatically removes melee observers from the player list.
- **Melee Observers Threshold**: Sets command threshold for observer detection, range from 1000 to 50000.
- **Alert Desynced**: Enables desync detection before the game starts.
- **Desynced Threshold**: Sets idle units threshold for desync alerts, range from 10 to 100.

## Plugin Settings
- **Server Port**: Specifies the plugin server port.
- **Development Directory**: Optional directory for plugin development, uses a directory picker.
- **Enabled Plugins**: List of enabled plugins.

## Postprocessing Settings
- **Anisotropy**: Sets texture anisotropy level, range based on max settings.
- **Antialias**: Controls anti-aliasing level, range based on max settings.
- **Bloom**: Sets bloom intensity, ranges from 0 to 10, hidden in production.
- **Brightness**: Controls brightness, range from -0.5 to 0.5.
- **Contrast**: Sets contrast, range from -0.5 to 0.5.
- **Fog of War**: Sets fog of war opacity, ranges from 0 to 1.

## Postprocessing 3D Settings
- **Tone Mapping**: Sets tone mapping exposure, ranges from 1 to 2, hidden in production.
- **Depth Focal Length**: Sets depth focal length, range from 1 to 20, hidden in production.
- **Depth Focal Range**: Sets depth focal range, range from 1 to 20, hidden in production.
- **Depth Bokeh Scale**: Controls bokeh scale, range from 1 to 5, hidden in production.
- **Depth Blur Quality**: Sets depth blur quality with preset options.
- **Environment Map**: Controls environment mapping, range from 0 to 2, hidden in production.
- **Sunlight Position**: Sets the position of sunlight, hidden in production.
- **Sunlight Intensity**: Controls sunlight intensity, range from 0 to 20, hidden in production.
- **Sunlight Color**: Sets the color of sunlight, hidden in production.
- **Shadow Quality**: Sets shadow quality, range from 0 to 8, hidden in production.


## Session Settings - Used by plugins & Macros
- **Type**: Determines the viewer's mode, options are Replay, Live, or Map.
- **Sandbox**: Enables sandbox mode, hidden by default.
- **Audio Listener Distance**: Sets the distance for 3d positional audio, ranges between 0 to 1. Mainly used by view controller plugins.

