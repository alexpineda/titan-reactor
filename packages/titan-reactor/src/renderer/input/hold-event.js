/*!
 * Modified to replace setInterval with a polling style
 * https://github.com/yomotsu/hold-event
 * (c) 2020 @yomotsu
 * Released under the MIT License.
 */
(function (global, factory) {
  typeof exports === "object" && typeof module !== "undefined"
    ? factory(exports)
    : typeof define === "function" && define.amd
    ? define(["exports"], factory)
    : ((global = global || self), factory((global.holdEvent = {})));
})(this, function (exports) {
  "use strict";

  (function (HOLD_EVENT_TYPE) {
    HOLD_EVENT_TYPE["HOLD_START"] = "holdStart";
    HOLD_EVENT_TYPE["HOLD_END"] = "holdEnd";
    HOLD_EVENT_TYPE["HOLDING"] = "holding";
  })(exports.HOLD_EVENT_TYPE || (exports.HOLD_EVENT_TYPE = {}));

  /* global Reflect, Promise */

  var extendStatics = function (d, b) {
    extendStatics =
      Object.setPrototypeOf ||
      ({ __proto__: [] } instanceof Array &&
        function (d, b) {
          d.__proto__ = b;
        }) ||
      function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
      };
    return extendStatics(d, b);
  };

  function __extends(d, b) {
    extendStatics(d, b);
    function __() {
      this.constructor = d;
    }
    d.prototype =
      b === null ? Object.create(b) : ((__.prototype = b.prototype), new __());
  }

  var EventDispatcher = (function () {
    function EventDispatcher() {
      this._listeners = {};
    }
    EventDispatcher.prototype.addEventListener = function (type, listener) {
      var listeners = this._listeners;
      if (listeners[type] === undefined) listeners[type] = [];
      if (listeners[type].indexOf(listener) === -1)
        listeners[type].push(listener);
    };
    EventDispatcher.prototype.removeEventListener = function (type, listener) {
      var listeners = this._listeners;
      var listenerArray = listeners[type];
      if (listenerArray !== undefined) {
        var index = listenerArray.indexOf(listener);
        if (index !== -1) listenerArray.splice(index, 1);
      }
    };
    EventDispatcher.prototype.dispatchEvent = function (event) {
      var listeners = this._listeners;
      var listenerArray = listeners[event.type];
      if (listenerArray !== undefined) {
        event.target = this;
        var array = listenerArray.slice(0);
        for (var i = 0, l = array.length; i < l; i++) {
          array[i].call(this, event);
        }
      }
    };
    return EventDispatcher;
  })();

  var Hold = (function (_super) {
    __extends(Hold, _super);
    function Hold(holdIntervalDelay) {
      if (holdIntervalDelay === void 0) {
        holdIntervalDelay = 100;
      }
      var _this = _super.call(this) || this;
      _this.holdIntervalDelay = 100;
      _this._enabled = true;
      _this._holding = false;
      _this._intervalId = -1;
      _this._deltaTime = 0;
      _this._elapsedTime = 0;
      _this._lastTime = 0;
      _this._elapsedUpdateDelta = 0;

      _this.update = (delta) => {
        if (!_this._holding) return;

        _this._elapsedUpdateDelta += delta;
        if (_this._elapsedUpdateDelta > _this.holdIntervalDelay) {
          var now = performance.now();
          _this._deltaTime = now - _this._lastTime;
          _this._elapsedTime += _this._deltaTime;
          _this._lastTime = performance.now();
          _this._elapsedUpdateDelta = 0;
          _this.dispatchEvent({
            type: exports.HOLD_EVENT_TYPE.HOLDING,
            deltaTime: _this._deltaTime,
            elapsedTime: _this._elapsedTime,
          });
        }
      };

      _this._holdStart = function (event) {
        if (!_this._enabled) return;
        if (_this._holding) return;
        _this._deltaTime = 0;
        _this._elapsedTime = 0;
        _this._elapsedUpdateDelta = 0;
        _this._lastTime = performance.now();
        _this.dispatchEvent({
          type: exports.HOLD_EVENT_TYPE.HOLD_START,
          deltaTime: _this._deltaTime,
          elapsedTime: _this._elapsedTime,
          originalEvent: event,
        });
        _this._holding = true;
      };
      _this._holdEnd = function (event) {
        if (!_this._enabled) return;
        if (!_this._holding) return;
        var now = performance.now();
        _this._deltaTime = now - _this._lastTime;
        _this._elapsedTime += _this._deltaTime;
        _this._lastTime = performance.now();
        _this.dispatchEvent({
          type: exports.HOLD_EVENT_TYPE.HOLD_END,
          deltaTime: _this._deltaTime,
          elapsedTime: _this._elapsedTime,
          originalEvent: event,
        });
        _this._holding = false;
      };
      _this.holdIntervalDelay = holdIntervalDelay;
      return _this;
    }
    Object.defineProperty(Hold.prototype, "enabled", {
      get: function () {
        return this._enabled;
      },
      set: function (enabled) {
        if (this._enabled === enabled) return;
        this._enabled = enabled;
        if (!this._enabled) this._holdEnd();
      },
      enumerable: true,
      configurable: true,
    });
    return Hold;
  })(EventDispatcher);

  var ElementHold = (function (_super) {
    __extends(ElementHold, _super);
    function ElementHold(element, holdIntervalDelay) {
      if (holdIntervalDelay === void 0) {
        holdIntervalDelay = 100;
      }
      var _this = _super.call(this, holdIntervalDelay) || this;
      _this._holdStart = _this._holdStart.bind(_this);
      _this._holdEnd = _this._holdEnd.bind(_this);
      var onPointerDown = _this._holdStart;
      var onPointerUp = _this._holdEnd;
      element.addEventListener("mousedown", onPointerDown);
      document.addEventListener("mouseup", onPointerUp);
      window.addEventListener("blur", _this._holdEnd);
      return _this;
    }
    return ElementHold;
  })(Hold);

  var KeyboardKeyHold = (function (_super) {
    __extends(KeyboardKeyHold, _super);
    function KeyboardKeyHold(keyCode, holdIntervalDelay) {
      if (holdIntervalDelay === void 0) {
        holdIntervalDelay = 100;
      }
      var _this = _super.call(this, holdIntervalDelay) || this;
      _this._holdStart = _this._holdStart.bind(_this);
      _this._holdEnd = _this._holdEnd.bind(_this);
      var onKeydown = function (event) {
        if (isInputEvent(event)) return;
        if (event.keyCode !== keyCode) return;
        _this._holdStart(event);
      };
      var onKeyup = function (event) {
        if (event.keyCode !== keyCode) return;
        _this._holdEnd(event);
      };
      document.addEventListener("keydown", onKeydown, {
        passive: true,
        capture: true,
      });
      document.addEventListener("keyup", onKeyup, {
        passive: true,
        capture: true,
      });
      window.addEventListener("blur", _this._holdEnd, {
        passive: true,
      });
      return _this;
    }
    return KeyboardKeyHold;
  })(Hold);
  function isInputEvent(event) {
    var target = event.target;
    return (
      target.tagName === "INPUT" ||
      target.tagName === "SELECT" ||
      target.tagName === "TEXTAREA" ||
      target.isContentEditable
    );
  }

  exports.ElementHold = ElementHold;
  exports.KeyboardKeyHold = KeyboardKeyHold;

  Object.defineProperty(exports, "__esModule", { value: true });
});
