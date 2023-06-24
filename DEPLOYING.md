# Building & Deploying Titan Reactor

Right now deploying TR is a manual process.

Build Titan Reactor using `yarn run dist`

Upload the release files to a github Release.

# Building & Deploying API Types

The types for the plugins and macros are separate packages located under `build/api-types`

Run `yarn run build-api-types`

Login to the titanreactor npm account ( or an account with access )

Publish both packages `host` and `runtime`
