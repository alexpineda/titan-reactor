import { OpenBW } from "./openbw";

const instances = new Map<number, OpenBW>();

const getOpenBW = async ( instance = 0 ) => {
    if ( instances.has( instance ) ) return instances.get( instance )!;

    const openBW = new OpenBW();
    await openBW.init();

    instances.set( instance, openBW );

    return openBW;
};

export { getOpenBW };
