Plugins are split into two parts:

Host - run in the game loop and can access everything
UI - run in an iframe and display react UI

The fundamental reason is so that we get process isolation and keep the game running smoothly outside of react updates. This does require that the UI get hosted in a separate domain so that the browser elevates it to a separate process.
