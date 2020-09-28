export class DebugLog {
  constructor(obj) {
    this.obj = obj;
  }

  log(...args) {
    let log = () => {};
    if (window.dbg) {
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
