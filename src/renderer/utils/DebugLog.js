export class DebugLog {
  constructor(module, obj) {
    this.module = module;
    this.assign(obj);
  }

  assign(obj) {
    this.obj = obj;
  }

  log(...args) {
    let log = () => {};
    if (window.dbg) {
      if (window.dbg.modules && !window.dbg.modules.includes(this.module)) {
        return log;
      }
      if (window.dbg.all) {
        log = console.log;
      } else if (
        window.dbg.iscriptId !== undefined &&
        this.obj.iscriptId === window.dbg.iscriptId
      ) {
        log = console.log;
      } else if (
        window.dbg.repId !== undefined &&
        this.obj.repId === window.dbg.repId
      ) {
        log = console.log;
      } else if (
        window.dbg.typeId !== undefined &&
        this.obj.typeId === window.dbg.typeId
      ) {
        log = console.log;
      }
    }
    log.call(log, args);
  }
}
