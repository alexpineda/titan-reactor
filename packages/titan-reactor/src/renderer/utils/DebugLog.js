export class DebugLog {
  constructor(module, obj) {
    this.module = module;
    this.assign(obj);
  }

  assign(obj) {
    this.obj = obj;
  }

  log(...args) {
    let log = false;
    if (window.dbg) {
      if (window.dbg.modules && !window.dbg.modules.includes(this.module)) {
        return;
      }
      if (window.dbg.all) {
        log = true;
      } else if (
        window.dbg.iscriptId !== undefined &&
        this.obj.iscriptId === window.dbg.iscriptId
      ) {
        log = true;
      } else if (
        window.dbg.repId !== undefined &&
        this.obj.repId === window.dbg.repId
      ) {
        log = true;
      } else if (
        window.dbg.typeId !== undefined &&
        this.obj.typeId === window.dbg.typeId
      ) {
        log = true;
      }
    }
    log && console.log(...args);
  }
}
