
export interface WorkerIcons extends RaceInsetIcons {
    apm: string;
}

export interface RaceInsetIcons {
    terran: string;
    zerg: string;
    protoss: string;
}

export interface CenteredCursorIcons {
    icons: string[];
    offX: number;
    offY: number;
}

export interface ResourceIcons extends RaceInsetIcons {
    minerals: string;
    vespeneZerg: string;
    vespeneTerran: string;
    vespeneProtoss: string;
    energy: string;
}