
// keep this as a separate type instead of usign Result because
// we will re-export this type in build-api-types for the plugin runtime
export type MinimapDimensions = {
    minimapWidth: number;
    minimapHeight: number;
}
