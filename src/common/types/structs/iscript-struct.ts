export interface IScriptStateStruct {
    // const iscript_t::script *current_script;
    programCounter: number;
    returnAddress: number;
    animation: number;
    wait: number;
}
