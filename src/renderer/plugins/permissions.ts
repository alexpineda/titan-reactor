export const PERMISSION_REPLAY_COMMANDS = "replay.commands";
export const PERMISSION_REPLAY_FILE = "replay.file";
export const PERMISSION_SYSTEM = "system";
export const PERMISSION_SANDBOX = "sandbox";

export const VALID_PERMISSIONS = [
    PERMISSION_REPLAY_COMMANDS,
    PERMISSION_REPLAY_FILE,
    PERMISSION_SYSTEM,
    PERMISSION_SANDBOX,
] as const;

export type VALID_PERMISSIONS = typeof VALID_PERMISSIONS[number];
