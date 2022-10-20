export type AnimFrame = {
    x: number;
    y: number;
    w: number;
    h: number;
    xoff: number;
    yoff: number;
};

export type GrpSprite = {
    w: number;
    h: number;
    frames: AnimFrame[];
    maxFrameH: number;
    maxFramew: number;
};

export type AnimDds = {
    ddsOffset: number;
    size: number;
    width: number;
    height: number;
};

export type AnimSpriteRef = {
    refId: number;
};

export type DDSGrpFrameType = {
    i: number;
    w: number;
    h: number;
    size: number;
    dds: Buffer;
};
