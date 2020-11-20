"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoreEvent = void 0;
var counter = 0;
var CoreEvent = (function () {
    function CoreEvent(name) {
        this._name = name;
        this._subscribers = new Map();
    }
    CoreEvent.prototype.dispatch = function (eventArgs) {
        var _this = this;
        this._subscribers
            .forEach(function (callback) { return callback(_this._name, eventArgs); });
        return this;
    };
    CoreEvent.prototype.add = function (callback) {
        this._subscribers.set(++counter, callback);
        return counter;
    };
    CoreEvent.prototype.remove = function (id) {
        return this._subscribers.delete(id);
    };
    return CoreEvent;
}());
exports.CoreEvent = CoreEvent;
