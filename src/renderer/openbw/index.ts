import { OpenBW } from "common/types";
import { createOpenBW } from "./create-openbw";

const openBws = new Map<number, OpenBW>();

const getOpenBW = async ( instance = 0 ) => {
    if ( openBws.has( instance ) ) return openBws.get( instance )!;

    const openBW = await createOpenBW();

    openBws.set( instance, openBW );
    return openBW;
};

export { getOpenBW };
